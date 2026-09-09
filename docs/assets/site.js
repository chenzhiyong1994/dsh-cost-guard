'use strict'

const english = new URLSearchParams(window.location.search).get('lang') === 'en'
const choose = (zh, en) => english ? en : zh

if (english) {
  document.documentElement.lang = 'en'
  document.title = 'DSH Cost Guard — Every token. Accounted for.'
  document.querySelector('meta[name="description"]').content = 'Live, local cost estimates for DeepSeek Harness. Track actual token usage, task costs, and per-model totals right beside your composer.'
  document.querySelectorAll('[data-en]').forEach(element => { element.textContent = element.dataset.en })
  for (const attribute of ['aria-label', 'alt']) {
    document.querySelectorAll(`[data-en-${attribute}]`).forEach(element => {
      element.setAttribute(attribute, element.getAttribute(`data-en-${attribute}`))
    })
  }
}

const languageSwitch = document.getElementById('language-switch')
languageSwitch.textContent = choose('EN ↗', '中文 ↗')
languageSwitch.lang = choose('en', 'zh-CN')
languageSwitch.setAttribute('aria-label', choose('Switch to English', '切换到简体中文'))
// Keep the current section when switching languages.
const updateLanguageLink = () => { languageSwitch.href = (english ? '?' : '?lang=en') + window.location.hash }
updateLanguageLink()
window.addEventListener('hashchange', updateLanguageLink)

const previews = {
  hud: {
    src: 'screenshots/hud-idle.png',
    alt: choose('DSH 输入框下方的开销横条，显示 token 用量、模型调用和会话累计', 'Cost Guard HUD below the DSH composer, showing tokens, model calls, and the session total'),
    caption: choose('当前或最近一次任务、token 构成、模型调用与会话累计，一眼可见。', 'Current or most recent task, token mix, model calls, and the session total at a glance.')
  },
  settings: {
    src: 'screenshots/settings-pricing.png',
    alt: choose('Cost Guard 设置页，显示可编辑模型单价、峰谷规则和按模型累计', 'Cost Guard settings with editable model rates, peak/off-peak windows, and per-model totals'),
    caption: choose('编辑模型价格、配置峰谷时段，查看按模型累计，并备份你的设置。', 'Edit model rates and peak/off-peak windows, inspect per-model totals, and back up your settings.')
  }
}

function showPreview(name) {
  const preview = previews[name]
  document.getElementById('product-screenshot').src = preview.src
  document.getElementById('product-screenshot').alt = preview.alt
  document.getElementById('screenshot-link').href = preview.src
  document.getElementById('screenshot-caption').textContent = preview.caption
  document.querySelectorAll('[data-preview]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.preview === name))
  })
}
document.querySelectorAll('[data-preview]').forEach(button => {
  button.addEventListener('click', () => showPreview(button.dataset.preview))
})
showPreview('hud')

const prompt = document.getElementById('install-prompt')
if (english) {
  prompt.textContent = `Install the dynamic Cordis plugin dsh-cost-guard from
https://github.com/chenzhiyong1994/dsh-cost-guard

Read docs/install.md and follow the online installation.
Before running it, use cordis_inspect_self and confirm
both hasHostHalf and hasClientHalf are true.
Then activate it and report the installed plugin ID.`
}

const copyButton = document.getElementById('copy-prompt')
const copyStatus = document.getElementById('copy-status')
copyButton.addEventListener('click', async () => {
  copyButton.disabled = true
  try {
    await navigator.clipboard.writeText(prompt.textContent)
    copyStatus.textContent = choose('已复制，粘贴到 DSH 即可。', 'Copied. Paste it into DSH.')
  } catch {
    // Keep the full prompt available when clipboard permission is denied.
    const range = document.createRange()
    range.selectNodeContents(prompt)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    prompt.focus()
    copyStatus.textContent = choose('已选中文本，请手动复制。', 'Text selected. Please copy manually.')
  } finally {
    copyButton.disabled = false
  }
})
