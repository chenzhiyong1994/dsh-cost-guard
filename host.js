return {
  inject: ['timer'],
  apply(ctx) {
    const sessions = ctx.get('sessions')

    // ---------------- defaults ----------------
    const DEFAULTS = {
      pricing: {
        'deepseek-v4-flash': { input: 1, output: 2, cacheRead: 0.02 },
        'deepseek-v4-pro': { input: 3, output: 6, cacheRead: 0.025 },
        default: { input: 1, output: 2, cacheRead: 0.02 },
        peak: { enabled: false, multiplier: 2, windows: [{ start: 9, end: 12 }, { start: 14, end: 18 }] }
      },
      display: { usdRate: 7.2 }
    }

    // ---------------- state ----------------
    const config = JSON.parse(JSON.stringify(DEFAULTS))
    const modelStats = {}
    const modelsBySession = {}
    const state = {}
    const MAX_TURNS = 40
    const FINAL = { completed: 1, aborted: 1, blocked: 1, error: 1 }

    // ---------------- helpers ----------------
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }
    function num(v) {
      const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN)
      return Number.isFinite(n) ? n : null
    }
    function r2(v) { return Math.round(v * 100) / 100 }
    function r6(v) { return Math.round(v * 1e6) / 1e6 }
    function fmtK(v) {
      if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
      if (v >= 1000) return (v / 1000).toFixed(1) + 'K'
      return String(Math.round(v))
    }
    function cnHour(epoch) { return Math.floor(((epoch / 3600000) + 8) % 24) }
    function inPeak(hour) {
      const p = config.pricing.peak
      if (!p || !p.enabled) return false
      const wins = p.windows || []
      for (const w of wins) {
        if (!w || typeof w !== 'object') continue
        const s = w.start, e = w.end
        if (s === e) continue
        if (s < e) { if (hour >= s && hour < e) return true }
        else { if (hour >= s || hour < e) return true }
      }
      return false
    }
    function pricingFor(model) {
      if (config.pricing[model]) return config.pricing[model]
      if (/v4-flash|deepseek-chat|flash/i.test(String(model || ''))) return config.pricing['deepseek-v4-flash'] || config.pricing.default || DEFAULTS.pricing.default
      if (/v4-pro|deepseek-reasoner|reasoner|pro/i.test(String(model || ''))) return config.pricing['deepseek-v4-pro'] || config.pricing.default || DEFAULTS.pricing.default
      return config.pricing.default || DEFAULTS.pricing.default
    }
    function effectivePrice(row, epoch) {
      const peak = inPeak(cnHour(epoch))
      const m = peak ? (config.pricing.peak.multiplier || 1) : 1
      return {
        input: row.input * m,
        output: row.output * m,
        cacheRead: row.cacheRead * m,
        cacheWrite: row.input * m,
        multiplier: m
      }
    }

    function ensureState(sid) {
      let st = state[sid]
      if (!st) st = state[sid] = { turns: {}, currentTurn: null, spentTotal: 0 }
      return st
    }
    function ensureTurn(sid, turn) {
      const st = ensureState(sid)
      let rec = st.turns[turn]
      if (!rec) rec = st.turns[turn] = {
        turn,
        status: 'open',
        model: null,
        actual: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, steps: 0, cost: 0 },
        startedAt: null, endedAt: null
      }
      return rec
    }
    function latestTurn(st) {
      let best = null
      for (const k of Object.keys(st.turns)) { const n = Number(k); if (best === null || n > best) best = n }
      return best === null ? null : st.turns[best]
    }
    function addUsage(rec, usage, price) {
      const a = rec.actual
      a.input += usage.inputTokens || 0
      a.output += usage.outputTokens || 0
      a.cacheRead += usage.cacheReadTokens || 0
      a.cacheWrite += usage.cacheWriteTokens || 0
      a.reasoning += usage.reasoningTokens || 0
      a.steps += 1
      const billedInput = usage.inputTokens || 0
      const billedCacheWrite = usage.cacheWriteTokens || 0
      const billedCacheRead = usage.cacheReadTokens || 0
      const billedOutput = usage.outputTokens || 0
      a.cost = r6(a.cost + billedInput / 1e6 * price.input + billedCacheWrite / 1e6 * price.cacheWrite + billedCacheRead / 1e6 * price.cacheRead + billedOutput / 1e6 * price.output)
    }
    function rootSessionOf(session) {
      let cur = session
      for (let i = 0; i < 8; i++) {
        const header = cur && cur.header
        if (!header || header.origin !== 'subagent' || !header.parentSession) return String(cur.id)
        const parent = sessions && sessions.get(header.parentSession)
        if (!parent) return String(cur.id)
        cur = parent
      }
      return String(cur.id)
    }
    function rollupTurnOf(sid) {
      const st = state[sid]
      if (!st) return null
      if (st.currentTurn !== null) {
        const rec = st.turns[st.currentTurn]
        if (rec && !FINAL[rec.status]) return rec
      }
      const last = latestTurn(st)
      return last
    }

    // ---------------- finalize ----------------
    function finalizeTurn(sid, turn, reason) {
      const st = state[sid]
      if (!st) return
      const rec = st.turns[turn]
      if (!rec) return
      if (FINAL[rec.status]) return
      const kind = reason && reason.kind ? reason.kind : 'completed'
      rec.status = FINAL[kind] ? kind : 'completed'
      rec.endedAt = Date.now()
      const a = rec.actual
      st.spentTotal = r6(st.spentTotal + a.cost)
      const model = rec.model || 'unknown'
      const ms = modelStats[model] || (modelStats[model] = { count: 0, actIn: 0, actOut: 0, cost: 0 })
      ms.count += 1
      ms.actIn += a.input + a.cacheRead + a.cacheWrite
      ms.actOut += a.output
      ms.cost = r6(ms.cost + a.cost)
      const nums = Object.keys(st.turns).map(Number).sort((x, y) => x - y)
      while (nums.length > MAX_TURNS) { const k = nums.shift(); delete st.turns[k] }
    }

    // ---------------- startup replay (rebuild from durable logs) ----------------
    function replay() {
      if (!sessions) return
      let list = []
      try { list = sessions.list() } catch (e) { return }
      for (const session of list) {
        try {
          const sid = String(session.id)
          const isRoot = !session.header || session.header.origin !== 'subagent'
          const events = session.events
          if (!events || !events.length) continue
          for (const event of events) {
            const data = event.data
            if (event.type === 'turn/start') {
              if (isRoot) {
                const st = ensureState(sid)
                st.currentTurn = data.turn
                ensureTurn(sid, data.turn)
              }
            } else if (event.type === 'assistant/message') {
              const usage = data && data.usage
              if (!usage) continue
              const rootSid = rootSessionOf(session)
              let rec = null
              if (rootSid === sid) {
                const st = ensureState(rootSid)
                if (st.currentTurn === null) continue
                rec = ensureTurn(rootSid, st.currentTurn)
              } else {
                rec = rollupTurnOf(rootSid)
                if (!rec) continue
              }
              const sel = modelsBySession[rootSid]
              const model = sel ? sel.model : (rec.model || 'deepseek-v4-flash')
              rec.model = model
              const price = effectivePrice(pricingFor(model), event.time || Date.now())
              addUsage(rec, usage, price)
              if (!FINAL[rec.status]) rec.status = 'running'
            } else if (event.type === 'turn/end') {
              if (isRoot) finalizeTurn(sid, data.turn, data.reason)
            }
          }
        } catch (e) { console.error('cost-guard: replay failed for session', String(session.id), e) }
      }
    }

    // ---------------- listeners ----------------
    ctx.on('agent/request', async (payload, next) => {
      const cfg = await next()
      try {
        if (cfg && typeof cfg === 'object' && cfg.model) {
          modelsBySession[String(payload.agent.id)] = { provider: cfg.provider || 'unknown', model: String(cfg.model) }
        }
      } catch (e) {}
      return cfg
    })

    ctx.on('session/event', (session, event) => {
      try {
        if (event.type === 'turn/start') {
          const header = session.header
          if (!header || header.origin !== 'subagent') {
            const st = ensureState(String(session.id))
            st.currentTurn = event.data.turn
            ensureTurn(String(session.id), event.data.turn)
          }
          return
        }
        if (event.type === 'assistant/message') {
          const usage = event.data && event.data.usage
          if (!usage) return
          const sid = rootSessionOf(session)
          let rec = null
          if (sid === String(session.id)) {
            rec = ensureTurn(sid, event.data.turn)
          } else {
            rec = rollupTurnOf(sid)
            if (!rec) return
          }
          const sel = modelsBySession[sid]
          const model = sel ? sel.model : (rec.model || 'deepseek-v4-flash')
          rec.model = model
          const price = effectivePrice(pricingFor(model), event.time || Date.now())
          addUsage(rec, usage, price)
          if (!FINAL[rec.status]) rec.status = 'running'
          return
        }
        if (event.type === 'turn/end') {
          const header = session.header
          if (!header || header.origin !== 'subagent') finalizeTurn(String(session.id), event.data.turn, event.data.reason)
          return
        }
      } catch (e) { console.error('cost-guard: session/event failed', e) }
    })

    ctx.on('session/disposed', (session) => {
      const sid = String(session.id)
      delete state[sid]
      delete modelsBySession[sid]
    })

    // ---------------- RPC helpers ----------------
    function turnView(rec) {
      if (!rec) return null
      return {
        turn: rec.turn,
        status: rec.status,
        model: rec.model,
        startedAt: rec.startedAt,
        endedAt: rec.endedAt,
        actual: {
          input: rec.actual.input, output: rec.actual.output,
          cacheRead: rec.actual.cacheRead, cacheWrite: rec.actual.cacheWrite,
          reasoning: rec.actual.reasoning, steps: rec.actual.steps,
          cost: rec.actual.cost
        }
      }
    }

    // ---------------- RPC handlers ----------------
    ctx.effect(() => harness.handle('config.get', () => {
      const totals = { sessions: Object.keys(state).length, spentTotal: 0, turnsTracked: 0 }
      for (const sid of Object.keys(state)) {
        totals.spentTotal += state[sid].spentTotal
        totals.turnsTracked += Object.keys(state[sid].turns).length
      }
      return { config: JSON.parse(JSON.stringify(config)), modelStats: JSON.parse(JSON.stringify(modelStats)), totals }
    }))

    ctx.effect(() => harness.handle('config.set', (args) => {
      const patch = (args && args.patch) || {}
      const errors = []
      if (patch.pricing && typeof patch.pricing === 'object') {
        for (const key of Object.keys(patch.pricing)) {
          if (key === '__proto__' || key === 'constructor') continue
          if (key === 'peak') {
            const p = patch.pricing.peak
            if (p && typeof p === 'object') {
              if (p.enabled !== undefined) config.pricing.peak.enabled = !!p.enabled
              if (p.multiplier !== undefined) {
                const v = num(p.multiplier)
                if (v === null || v < 1 || v > 10) errors.push('pricing.peak.multiplier')
                else config.pricing.peak.multiplier = r2(v)
              }
              if (p.windows !== undefined) {
                let winsOk = true
                const wins = []
                if (!Array.isArray(p.windows) || p.windows.length > 4) winsOk = false
                else {
                  for (const w of p.windows) {
                    if (!w || typeof w !== 'object') { winsOk = false; break }
                    const s = num(w.start), e = num(w.end)
                    if (s === null || e === null || s < 0 || s > 23 || e < 0 || e > 23) { winsOk = false; break }
                    wins.push({ start: Math.round(s), end: Math.round(e) })
                  }
                }
                if (!winsOk) errors.push('pricing.peak.windows')
                else config.pricing.peak.windows = wins
              }
            }
            continue
          }
          const p = patch.pricing[key]
          if (p === null) { delete config.pricing[key]; continue }
          if (typeof p !== 'object') { errors.push('pricing.' + key); continue }
          const row = {}
          for (const f of ['input', 'output', 'cacheRead']) {
            if (p[f] !== undefined) {
              const v = num(p[f])
              if (v === null || v < 0 || v > 1000) errors.push('pricing.' + key + '.' + f)
              else row[f] = v
            }
          }
          config.pricing[key] = Object.assign({}, config.pricing[key] || { input: 0, output: 0, cacheRead: 0 }, row)
        }
      }
      if (patch.display && typeof patch.display === 'object' && patch.display.usdRate !== undefined) {
        const v = num(patch.display.usdRate)
        if (v === null || v < 0.5 || v > 20) errors.push('display.usdRate')
        else config.display.usdRate = r2(v)
      }
      return { ok: errors.length === 0, errors, config: JSON.parse(JSON.stringify(config)) }
    }))

    ctx.effect(() => harness.handle('config.reset-pricing', () => {
      config.pricing = JSON.parse(JSON.stringify(DEFAULTS.pricing))
      return { ok: true, config: JSON.parse(JSON.stringify(config)) }
    }))

    ctx.effect(() => harness.handle('config.export', () => ({ json: JSON.parse(JSON.stringify(config)) })))

    ctx.effect(() => harness.handle('config.import', (args) => {
      const json = args && args.json
      if (!json || typeof json !== 'object' || Array.isArray(json)) return { ok: false, errors: ['无效的配置对象'] }
      const merged = JSON.parse(JSON.stringify(DEFAULTS))
      if (json.pricing && typeof json.pricing === 'object') {
        for (const key of Object.keys(json.pricing)) {
          if (key === '__proto__' || key === 'constructor') continue
          if (key === 'peak') {
            if (json.pricing.peak && typeof json.pricing.peak === 'object') {
              merged.pricing.peak = Object.assign({}, merged.pricing.peak, json.pricing.peak)
              if (Array.isArray(json.pricing.peak.windows)) {
                const wins = []
                for (const w of json.pricing.peak.windows) {
                  if (!w || typeof w !== 'object') continue
                  const s = num(w.start), e = num(w.end)
                  if (s !== null && e !== null && s >= 0 && s <= 23 && e >= 0 && e <= 23) wins.push({ start: Math.round(s), end: Math.round(e) })
                }
                merged.pricing.peak.windows = wins
              }
            }
            continue
          }
          const p = json.pricing[key]
          if (p && typeof p === 'object') {
            const row = {}
            for (const f of ['input', 'output', 'cacheRead']) {
              const v = num(p[f])
              if (v !== null && v >= 0) row[f] = v
            }
            if (row.input !== undefined || row.output !== undefined) merged.pricing[key] = Object.assign({ input: 1, output: 2, cacheRead: 0.02 }, row)
          }
        }
      }
      if (json.display && typeof json.display === 'object') merged.display = Object.assign({}, merged.display, json.display)
      config.pricing = merged.pricing
      config.display = merged.display
      return { ok: true, config: JSON.parse(JSON.stringify(config)) }
    }))

    ctx.effect(() => harness.handle('live', (args) => {
      const sid = args && args.sessionId ? String(args.sessionId) : null
      if (!sid) return null
      const st = state[sid]
      if (!st) return null
      const rec = (st.currentTurn !== null && st.turns[st.currentTurn]) || latestTurn(st)
      if (!rec) return { present: true, usdRate: config.display.usdRate, peakEnabled: !!config.pricing.peak.enabled, peakNow: inPeak(cnHour(Date.now())), spentTotal: st.spentTotal, current: null, lastFinal: null }
      let lastFinal = null
      const nums = Object.keys(st.turns).map(Number).sort((x, y) => y - x)
      for (const n of nums) {
        const t = st.turns[n]
        if (FINAL[t.status] && t.turn !== rec.turn) { lastFinal = turnView(t); break }
      }
      return {
        present: true,
        usdRate: config.display.usdRate,
        peakEnabled: !!config.pricing.peak.enabled,
        peakNow: inPeak(cnHour(Date.now())),
        spentTotal: st.spentTotal,
        current: turnView(rec),
        lastFinal
      }
    }))

    ctx.effect(() => harness.handle('turn', (args) => {
      const sid = args && args.sessionId ? String(args.sessionId) : null
      const turn = args && args.turn
      if (!sid || turn === undefined) return null
      const st = state[sid]
      if (!st) return null
      const rec = st.turns[turn]
      if (!rec) return null
      return turnView(rec)
    }))

    // ---------------- startup ----------------
    replay()
  }
}
