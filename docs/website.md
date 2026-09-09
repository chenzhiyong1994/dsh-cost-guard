# Project website / 项目主页

The project website is hosted on **GitHub Pages**:

- 简体中文: https://chenzhiyong1994.github.io/dsh-cost-guard/
- English: https://chenzhiyong1994.github.io/dsh-cost-guard/?lang=en

## Edit and preview / 编辑与预览

The site is plain HTML, CSS, and JavaScript. It has no build step, third-party fonts, analytics, or runtime dependencies.

主页使用原生 HTML、CSS 和 JavaScript，无需构建，不加载第三方字体或统计服务。

| File / 文件 | Purpose / 用途 |
| --- | --- |
| `docs/index.html` | Chinese content, English translations in `data-en` attributes, metadata / 中文正文、英文翻译和元信息 |
| `docs/assets/site.css` | Layout, responsive styles, reduced motion / 布局、响应式样式和减少动效支持 |
| `docs/assets/site.js` | Language, screenshot switching, copy prompt / 语言、截图切换和复制提示词 |
| `docs/assets/`, `docs/screenshots/` | Shared project artwork and screenshots / 共用项目素材和截图 |
| `.github/workflows/pages.yml` | Check and deploy `docs/` / 检查并发布 `docs/` |

From the repository root / 在仓库根目录执行:

```sh
npm run check
python -m http.server 8349 --bind 127.0.0.1 --directory docs
```

Open http://127.0.0.1:8349/ and check both languages, narrow and wide layouts, screenshot buttons, keyboard navigation, and prompt copying. If clipboard access is denied, the page selects the prompt for manual copying. Without JavaScript, the Chinese page and installation prompt remain readable.

打开 http://127.0.0.1:8349/，检查中英两种语言、宽窄屏布局、截图按钮、键盘导航和提示词复制。剪贴板权限被拒绝时，页面会选中文本供手动复制。禁用 JavaScript 后，中文正文和安装提示词仍可阅读。

The receipt on the homepage is illustrative: 120,000 cache-miss input tokens, 18,000 output tokens, and 47,100 cache-hit input tokens, at sample rates of 1.5 / 4.5 / 0.05 CNY per million tokens. The unrounded estimate is CNY 0.263355. These are example settings, not a claim about current provider prices. Keep the plugin version, compatibility statement, and install prompt aligned with the README when updating the site.

主页收据使用示例用量与示例单价，未四舍五入的合计为 ¥0.263355，不代表供应商当前价格。更新页面时，让插件版本、兼容性说明和安装提示词与 README 保持一致。

## Publishing / 发布

In the repository’s **Settings → Pages → Build and deployment**, the source must be **GitHub Actions**. The `Deploy GitHub Pages` workflow checks the project, uploads `docs/`, and deploys to the `github-pages` environment. A push to `main` that touches its listed paths triggers deployment; it can also be run from **Actions → Deploy GitHub Pages → Run workflow**. The existing `check` workflow still runs for every push and pull request.

在仓库 **Settings → Pages → Build and deployment** 中，Source 设置为 **GitHub Actions**。`Deploy GitHub Pages` 工作流先检查项目，再上传 `docs/` 并发布到 `github-pages` 环境。推送到 `main` 且修改了工作流列出的路径时自动部署；也可从 **Actions → Deploy GitHub Pages → Run workflow** 手动运行。既有 `check` 工作流继续检查所有 push 和 pull request。

All local asset URLs are relative so the site works under GitHub Pages’ `/dsh-cost-guard/` project path. Installation and source links point to the GitHub repository. When deploying a fork, update the repository links, canonical URL, Open Graph URL/image, and package homepage to the fork’s address.

站内素材均使用相对路径，兼容 GitHub Pages 的 `/dsh-cost-guard/` 项目子路径。安装文档和源码链接指向 GitHub 仓库。部署 fork 时，应同步修改仓库链接、canonical、Open Graph 地址和 package homepage。

Reference / 参考: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
