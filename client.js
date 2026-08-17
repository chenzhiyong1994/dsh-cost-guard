return {
  inject: ['timer'],
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    const h = React.createElement

    styles.insert(`
.cg-root{font-family:inherit;color:var(--dsw-alias-label-primary)}
.cg-muted{color:var(--dsw-alias-label-secondary)}
.cg-mono{font-variant-numeric:tabular-nums}

/* ---------- dock HUD ---------- */
.cg-hud{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 16px;width:calc(100% + var(--dsh-composer-dock-inset,8px) * 4);max-width:var(--dsh-composer-card-max-width,780px);margin:10px calc(var(--dsh-composer-dock-inset,8px) * -2) 4px;padding:6px 12px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);font-size:12px;animation:cg-hud-in .35s ease}
@keyframes cg-hud-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.cg-hud-left{display:inline-flex;align-items:center;gap:10px;white-space:nowrap;min-width:0;flex-wrap:wrap}
.cg-hud-label{font-weight:600;white-space:nowrap}
.cg-hud-nums{white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.cg-hud-nums b{color:var(--dsw-alias-label-primary);font-weight:650}
.cg-model{display:inline-block;padding:1px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.cg-stats{display:inline-flex;align-items:center;gap:10px;white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);flex-wrap:wrap}
.cg-stats b{color:var(--dsw-alias-label-primary);font-weight:600}
.cg-badge{display:inline-block;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid}
.cg-badge.good{color:var(--dsw-alias-state-success-primary);border-color:currentColor}
.cg-badge.peak{color:#e8a13c;border-color:currentColor}
@media (max-width:640px){.cg-stat-cache{display:none}}

/* ---------- settings page ---------- */
.cg-settings{display:flex;flex-direction:column;gap:14px;padding:4px 2px 20px;font-size:13px}
.cg-section{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:14px 16px}
.cg-section-title{font-size:13.5px;font-weight:650;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.cg-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.cg-row:last-child{border-bottom:none}
.cg-row-label{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.cg-row-label .sub{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.35}
.cg-input{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 9px;font-size:13px;width:110px;transition:border-color .15s ease,box-shadow .15s ease;font-variant-numeric:tabular-nums}
.cg-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,transparent)}
.cg-input.small{width:64px}
.cg-switch{position:relative;width:42px;height:23px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);cursor:pointer;transition:background .2s ease,border-color .2s ease;flex:none;padding:0}
.cg-switch .cg-knob{position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:var(--dsw-alias-label-secondary);transition:transform .22s cubic-bezier(.22,1,.36,1),background .2s ease,box-shadow .2s ease}
.cg-switch.on{background:linear-gradient(135deg,#4f6bff,#7c5cff);border-color:transparent}
.cg-switch.on .cg-knob{transform:translateX(19px);background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.cg-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.cg-saved{color:var(--dsw-alias-state-success-primary);font-size:12px;animation:cg-pop .25s ease}
@keyframes cg-pop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:none}}
.cg-error{color:var(--dsw-alias-state-error-primary);font-size:12px}
.cg-price-grid{display:grid;grid-template-columns:1.4fr repeat(3,64px) 28px;gap:6px;align-items:center;font-size:11px;color:var(--dsw-alias-label-secondary);padding:3px 0}
.cg-price-grid .head{font-size:10.5px}
.cg-price-grid .name{color:var(--dsw-alias-label-primary);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cg-del{background:none;border:none;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:14px;padding:2px 6px;border-radius:6px}
.cg-del:hover{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2)}
.cg-addrow{display:flex;gap:8px;margin-top:10px}
.cg-addrow .cg-input{flex:1;width:auto}
.cg-btn2{padding:7px 13px;border-radius:8px;font-size:12.5px;font-weight:600;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);cursor:pointer;transition:transform .12s ease,filter .15s ease}
.cg-btn2:hover{filter:brightness(1.12)}
.cg-btn2:active{transform:scale(.96)}
.cg-btn2.primary{border-color:transparent;background:linear-gradient(135deg,var(--dsw-alias-brand-primary),#5f7fff);color:#fff}
.cg-statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.cg-stat{background:var(--dsw-alias-bg-layer-2);border-radius:9px;padding:9px 11px}
.cg-stat .k{font-size:11px;color:var(--dsw-alias-label-secondary)}
.cg-stat .v{font-size:15px;font-weight:650;font-variant-numeric:tabular-nums}
.cg-io-area{width:100%;min-height:120px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;color:var(--dsw-alias-label-primary);font-family:ui-monospace,monospace;font-size:11px;padding:8px;margin-top:8px;box-sizing:border-box}
.cg-note{font-size:11.5px;line-height:1.6}
.cg-table{width:100%;border-collapse:collapse;font-size:12px}
.cg-table td{padding:6px 4px;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.cg-table td:first-child{color:var(--dsw-alias-label-primary)}
`)

    // ---------------- helpers ----------------
    function num(v) { const n = typeof v === 'number' ? v : Number(v); return Number.isFinite(n) && v !== '' ? n : null }
    function money(v) { if (v === null || v === undefined) return '—'; return '¥' + (v < 0.01 ? v.toFixed(4) : v.toFixed(2)) }
    function usdEq(v, rate) { if (v === null || v === undefined || !rate) return ''; const u = v / rate; return '≈$' + (u < 0.01 ? u.toFixed(4) : u.toFixed(2)) }
    function tok(v) { if (v === null || v === undefined) return '—'; return v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(Math.round(v)) }
    function winsText(wins) {
      if (!wins || !wins.length) return '未设置'
      return wins.map((w) => w.start + ':00–' + w.end + ':00').join('、')
    }

    function Switch(props) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': !!props.on,
        className: 'cg-switch' + (props.on ? ' on' : ''),
        onClick: () => props.onToggle(!props.on)
      }, h('span', { className: 'cg-knob' }))
    }

    function NumField(props) {
      const [text, setText] = React.useState(String(props.value))
      React.useEffect(() => { setText(String(props.value)) }, [props.value])
      const commit = (raw) => {
        const n = num(raw)
        if (n === null) { setText(String(props.value)); return }
        let v = n
        if (props.min !== undefined && n < props.min) v = props.min
        if (props.max !== undefined && n > props.max) v = props.max
        if (v === props.value) { setText(String(props.value)); return }
        setText(String(v))
        props.onCommit(v)
      }
      return h('div', { className: 'cg-row' },
        h('span', { className: 'cg-row-label' },
          h('span', null, props.label),
          props.sub ? h('span', { className: 'sub' }, props.sub) : null
        ),
        h('input', {
          className: 'cg-input' + (props.small ? ' small' : ''),
          type: 'number',
          step: props.step === undefined ? 'any' : props.step,
          min: props.min, max: props.max,
          value: text,
          onChange: (e) => setText(e.target.value),
          onBlur: () => commit(text),
          onKeyDown: (e) => { if (e.key === 'Enter') e.target.blur() }
        })
      )
    }

    function Row(props) {
      return h('div', { className: 'cg-row' },
        h('span', { className: 'cg-row-label' },
          h('span', null, props.label),
          props.sub ? h('span', { className: 'sub' }, props.sub) : null
        ),
        props.control
      )
    }

    function Section(props) {
      return h('div', { className: 'cg-section' },
        h('div', { className: 'cg-section-title' }, props.title, props.right || null),
        props.children
      )
    }

    // ---------------- dock HUD ----------------
    function Hud(props) {
      const ctx = props.ctx
      const sessionId = props.sessionId
      const [snap, setSnap] = React.useState(null)

      React.useEffect(() => {
        if (!sessionId) return
        let alive = true
        const load = () => {
          host.call('live', { sessionId }).then((s) => { if (alive && s && s.present) setSnap(s) }).catch(() => {})
        }
        load()
        const dis = ctx.interval(load, 1200)
        return () => { alive = false; dis() }
      }, [ctx, sessionId])

      if (!snap || !snap.current) return null
      const cur = snap.current
      const st = cur.status
      const running = st === 'running' || st === 'open'
      const view = running ? cur : ((cur.actual && cur.actual.cost > 0) ? cur : snap.lastFinal)
      if (!view || !view.actual) return null
      const a = view.actual
      if (!running && a.cost === 0) return null
      const shortModel = (m) => (m ? String(m).replace(/^deepseek-/i, '') : '—')

      const leftGroup = h('span', { className: 'cg-hud-left' },
        h('span', { className: 'cg-hud-label' }, running ? '⚡ 执行中' : '💤 空闲'),
        h('span', { className: 'cg-hud-nums' },
          h('b', null, money(a.cost)),
          ' ' + usdEq(a.cost, snap.usdRate),
          running ? null : '（上次）'
        ),
        h('span', { className: 'cg-model' }, shortModel(view.model))
      )
      const stats = h('span', { className: 'cg-stats' },
        h('span', null, '输入 ', h('b', null, tok(a.input))),
        h('span', null, '输出 ', h('b', null, tok(a.output))),
        h('span', { className: 'cg-stat-cache' }, '缓存命中 ', h('b', null, tok(a.cacheRead))),
        h('span', null, '调用 ', h('b', null, a.steps), ' 次'),
        !running && snap.spentTotal > 0 ? h('span', { className: 'cg-stat-total' }, '累计 ', h('b', null, money(snap.spentTotal))) : null,
        snap.peakEnabled ? (snap.peakNow ? h('span', { className: 'cg-badge peak' }, '高') : h('span', { className: 'cg-badge good' }, '基')) : null
      )
      return h('div', { className: 'cg-hud' }, leftGroup, stats)
    }

    // ---------------- settings page ----------------
    function SettingsPage(props) {
      const ctx = props.ctx
      const [cfg, setCfg] = React.useState(null)
      const [extra, setExtra] = React.useState({ modelStats: {}, totals: {} })
      const [saved, setSaved] = React.useState(false)
      const [err, setErr] = React.useState(null)
      const [addModel, setAddModel] = React.useState('')
      const [ioOpen, setIoOpen] = React.useState(false)
      const [ioText, setIoText] = React.useState('')
      const timers = []

      React.useEffect(() => () => { for (const d of timers) try { d() } catch (e) {} }, [])
      const later = (fn, ms) => { const d = ctx.timeout(fn, ms); timers.push(d); return d }

      React.useEffect(() => {
        host.call('config.get', {}).then((res) => {
          if (res && res.config) {
            setCfg(res.config)
            setExtra({ modelStats: res.modelStats || {}, totals: res.totals || {} })
          }
        }).catch(() => setErr('无法连接 Host（插件可能未运行）'))
      }, [ctx])

      const flash = () => { setSaved(true); setErr(null); later(() => setSaved(false), 1600) }
      const save = (patch) => {
        host.call('config.set', { patch }).then((res) => {
          if (res && res.ok && res.config) { setCfg(res.config); flash() }
          else setErr((res && res.errors && res.errors.join('、')) || '保存失败')
        }).catch(() => setErr('保存失败：连接错误'))
      }
      const callAndRefresh = (method, args) => {
        host.call(method, args).then((res) => {
          if (res && res.ok && res.config) {
            setCfg(res.config)
            if (res.modelStats) setExtra(Object.assign({}, extra, { modelStats: res.modelStats }))
            flash()
          } else setErr('操作失败')
        }).catch(() => setErr('操作失败：连接错误'))
      }

      if (!cfg) return h('div', { className: 'cg-settings cg-root' }, err ? h('div', { className: 'cg-error' }, err) : h('div', { className: 'cg-muted' }, '加载配置中…'))

      const peak = cfg.pricing.peak
      const priceKeys = Object.keys(cfg.pricing).filter((k) => k !== 'peak')
      const builtins = { 'deepseek-v4-flash': 1, 'deepseek-v4-pro': 1, default: 1 }
      const ms = extra.modelStats
      const totals = extra.totals
      const peakWins = peak.windows || []
      const editWindow = (i, field, value) => {
        const v = num(value)
        if (v === null || v < 0 || v > 23) return
        const wins = peakWins.map((w, j) => j === i ? Object.assign({}, w, { [field]: Math.round(v) }) : w)
        save({ pricing: { peak: { windows: wins } } })
      }

      return h('div', { className: 'cg-settings cg-root' },
        saved ? h('div', { className: 'cg-saved' }, '✓ 已保存') : null,
        err ? h('div', { className: 'cg-error' }, err) : null,

        h(Section, { title: '模型定价（¥ / 1M tokens · 基础价）', right: h('button', { className: 'cg-btn2', onClick: () => callAndRefresh('config.reset-pricing', {}) }, '恢复默认') },
          h(Row, { label: '自定义时段倍率', sub: '开启后，' + winsText(peakWins) + ' 内的基础单价 × ' + peak.multiplier + '。请根据你的实际供应商账单设置', control: h(Switch, { on: peak.enabled, onToggle: (v) => save({ pricing: { peak: { enabled: v } } }) }) }),
          h(NumField, { label: '时段倍率', sub: '指定时段的基础价格倍率', value: peak.multiplier, step: 0.5, min: 1, max: 10, onCommit: (v) => save({ pricing: { peak: { multiplier: v } } }) }),
          h(Row, { label: '调价时段', sub: '北京时间；开始 = 结束则该窗口无效', control: h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' } },
            peakWins.map((w, i) => h('div', { key: i, style: { display: 'flex', gap: 6, alignItems: 'center' } },
              h('input', { className: 'cg-input small', type: 'number', min: 0, max: 23, value: w.start, onChange: (ev) => editWindow(i, 'start', ev.target.value) }),
              h('span', { className: 'cg-muted' }, '—'),
              h('input', { className: 'cg-input small', type: 'number', min: 0, max: 23, value: w.end, onChange: (ev) => editWindow(i, 'end', ev.target.value) })
            ))
          ) }),
          h('div', { className: 'cg-price-grid' },
            h('span', { className: 'head' }, '模型'),
            h('span', { className: 'head' }, '输入·未命中'),
            h('span', { className: 'head' }, '输出'),
            h('span', { className: 'head' }, '输入·命中'),
            h('span', null)
          ),
          priceKeys.map((key) => h('div', { className: 'cg-price-grid', key },
            h('span', { className: 'name' }, key === 'default' ? '其他模型' : key),
            ['input', 'output', 'cacheRead'].map((f) => h('input', {
              key: f,
              className: 'cg-input small',
              type: 'number', step: 'any', min: 0,
              value: cfg.pricing[key][f],
              onChange: (ev) => {
                const v = num(ev.target.value)
                if (v === null || v < 0) return
                const patch = { pricing: {} }
                patch.pricing[key] = {}
                patch.pricing[key][f] = v
                host.call('config.set', { patch }).then((res) => { if (res && res.ok && res.config) { setCfg(res.config); flash() } }).catch(() => {})
              }
            })),
            builtins[key] ? h('span', null) : h('button', {
              className: 'cg-del',
              onClick: () => { const patch = { pricing: {} }; patch.pricing[key] = null; save(patch) }
            }, '✕')
          )),
          h('div', { className: 'cg-addrow' },
            h('input', { className: 'cg-input', placeholder: '新模型 ID，如 deepseek-v4-flash', value: addModel, onChange: (ev) => setAddModel(ev.target.value) }),
            h('button', {
              className: 'cg-btn2',
              onClick: () => {
                const name = addModel.trim()
                if (!name) return
                const patch = { pricing: {} }
                patch.pricing[name] = { input: 1, output: 2, cacheRead: 0.02 }
                save(patch)
                setAddModel('')
              }
            }, '添加')
          ),
          h('div', { className: 'cg-muted', style: { fontSize: 11, marginTop: 8 } }, '缓存写入 token 按「输入·未命中」价计费（官方无单独缓存写计费项）')
        ),

        h(Section, { title: '会话累计' },
          h('div', { className: 'cg-statgrid' },
            h('div', { className: 'cg-stat' }, h('div', { className: 'k' }, '已结算任务'), h('div', { className: 'v' }, totals.turnsTracked)),
            h('div', { className: 'cg-stat' }, h('div', { className: 'k' }, '实际累计'), h('div', { className: 'v' }, money(totals.spentTotal))),
            h('div', { className: 'cg-stat' }, h('div', { className: 'k' }, '汇率（¥/USD）'), h('div', { className: 'v' }, cfg.display.usdRate))
          ),
          Object.keys(ms).length ? h('table', { className: 'cg-table' }, h('tbody', null,
            Object.keys(ms).map((m) => {
              const s = ms[m]
              return h('tr', { key: m },
                h('td', null, m + ' ×' + s.count),
                h('td', null, '输入 ' + tok(s.actIn) + ' · 输出 ' + tok(s.actOut)),
                h('td', null, money(s.cost))
              )
            })
          )) : h('div', { className: 'cg-muted' }, '暂无样本——执行任务后自动积累')
        ),

        h(Section, { title: '配置备份', right: h('button', { className: 'cg-btn2', onClick: () => setIoOpen(!ioOpen) }, ioOpen ? '收起' : '导入 / 导出') },
          ioOpen ? h('div', null,
            h('textarea', { className: 'cg-io-area', placeholder: '粘贴配置 JSON 后点击导入；导出会填入当前配置', value: ioText, onChange: (ev) => setIoText(ev.target.value) }),
            h('div', { style: { display: 'flex', gap: 8, marginTop: 8 } },
              h('button', {
                className: 'cg-btn2 primary',
                onClick: () => {
                  host.call('config.import', { json: (() => { try { return JSON.parse(ioText) } catch (e) { return null } })() }).then((res) => {
                    if (res && res.ok && res.config) { setCfg(res.config); flash() }
                    else setErr('导入失败：JSON 格式无效')
                  }).catch(() => setErr('导入失败：连接错误'))
                }
              }, '导入'),
              h('button', {
                className: 'cg-btn2',
                onClick: () => {
                  host.call('config.export', {}).then((res) => { if (res && res.json) setIoText(JSON.stringify(res.json, null, 2)) }).catch(() => {})
                }
              }, '导出当前配置')
            )
          ) : null
        ),

        h('div', { className: 'cg-muted cg-note' }, '开销监控使用 DSH 记录的真实 token 用量与当前配置单价计算本地费用估算，不参与执行决策。默认单价可能随供应商调价而过时，请以实际账单为准并及时更新。历史轮次在插件启动时自动从会话日志重建。')
      )
    }

    // ---------------- registrations ----------------
    slots.inject('conversation.composer.dock', () => slots.register(
      { name: 'conversation.composer.dock', id: 'cost-guard-hud', order: 5 },
      (props) => h(Hud, Object.assign({}, props, { ctx }))
    ))
    slots.inject('settings.section', () => slots.register(
      { name: 'settings.section', id: 'cost-guard', order: 40, label: '开销监控' },
      (props) => h(SettingsPage, Object.assign({}, props, { ctx }))
    ))
  }
}
