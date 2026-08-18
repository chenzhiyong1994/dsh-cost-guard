// host.js / client.js are function-body fragments consumed by cordis_define.
// Compile both halves and check the release facts that public docs depend on.
const fs = require('fs')
const path = require('path')
const assert = require('assert')

const files = ['host.js', 'client.js']
let ok = true
const root = path.join(__dirname, '..')

for (const f of files) {
  const p = path.join(root, f)
  const code = fs.readFileSync(p, 'utf8')
  try {
    // eslint-disable-next-line no-new-func
    new Function(code)
    console.log(`[check] ok   ${f}`)
  } catch (e) {
    ok = false
    console.error(`[check] FAIL ${f}: ${e.message}`)
  }
}

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8')
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8')
  const readmeZh = fs.readFileSync(path.join(root, 'README.zh-CN.md'), 'utf8')
  const hostCode = fs.readFileSync(path.join(root, 'host.js'), 'utf8')
  const clientCode = fs.readFileSync(path.join(root, 'client.js'), 'utf8')

  for (const required of [
    'LICENSE', 'README.md', 'README.zh-CN.md', 'CHANGELOG.md', 'CONTRIBUTING.md',
    'SECURITY.md', 'host.js', 'client.js', 'docs/assets/hero-cost-guard.png',
    'docs/screenshots/hud-idle.png', 'docs/screenshots/settings-pricing.png'
  ]) {
    assert(fs.existsSync(path.join(root, required)), `missing ${required}`)
  }

  assert(pkg.keywords.includes('dsh-plugin'), 'package keywords must include dsh-plugin')
  assert(changelog.includes(`[${pkg.version}]`), 'CHANGELOG must include package version')
  assert(readme.includes(`v${pkg.version}`), 'English README must include package version')
  assert(readmeZh.includes(`v${pkg.version}`), 'Chinese README must include package version')
  assert(readme.includes('README.zh-CN.md') && readmeZh.includes('README.md'), 'language switch links are missing')

  const handlers = {}
  const harnessMock = {
    handle(name, fn) {
      handlers[name] = fn
      return () => {}
    }
  }
  // eslint-disable-next-line no-new-func
  const hostPlugin = new Function('harness', hostCode)(harnessMock)
  hostPlugin.apply({
    get(name) {
      if (name === 'sessions') return { list: () => [] }
      return undefined
    },
    on() { return () => {} },
    effect(fn) { return fn() }
  })
  const config = handlers['config.get']().config
  assert.deepStrictEqual(config.pricing['deepseek-v4-flash'], { input: 1.5, output: 4.5, cacheRead: 0.05 })
  assert.deepStrictEqual(config.pricing['deepseek-v4-pro'], { input: 4.5, output: 13.5, cacheRead: 0.15 })
  assert.strictEqual(config.pricing.peak.enabled, true, 'official peak/off-peak schedule must default to on')
  assert(hostCode.includes('peakEnabled') && clientCode.includes('peakEnabled'), 'HUD must know whether the schedule is enabled')
  console.log(`[check] ok   release facts v${pkg.version}`)
} catch (e) {
  ok = false
  console.error(`[check] FAIL release facts: ${e.message}`)
}

if (!ok) process.exit(1)
console.log('[check] all checks passed: both Cordis halves and public release facts are consistent')
