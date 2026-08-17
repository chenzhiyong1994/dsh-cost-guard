# Installation / 安装

[English](#english) · [简体中文](#简体中文)

## English

`dsh-cost-guard` is a dynamic Cordis package with a Host half and a Web Client half. Both halves must be defined together.

### Online installation prompt

Paste the following into a DSH conversation:

```text
Install the open-source dynamic Cordis plugin dsh-cost-guard:

1. Fetch the latest contents of both files:
   - https://raw.githubusercontent.com/chenzhiyong1994/dsh-cost-guard/main/host.js
   - https://raw.githubusercontent.com/chenzhiyong1994/dsh-cost-guard/main/client.js
2. Call cordis_define with:
   - plugin: { kind: "new", idPrefix: "cguard" }
   - code.host: the complete host.js contents
   - code.client: the complete client.js contents
3. Call cordis_inspect_self for the new package. Confirm hasHostHalf and
   hasClientHalf are both true. If either half is missing, redefine the
   existing package with both complete files; do not run it yet.
4. After both halves pass inspection, call cordis_run to activate it.
5. Report the installed plugin ID and where to find Settings → Cost Guard.
```

### Offline installation

Download or copy [`host.js`](../host.js) and [`client.js`](../client.js), then paste both complete files into the following request:

```text
Define a new dynamic Cordis plugin with idPrefix "cguard". Use the complete
host.js text below as code.host and the complete client.js text below as
code.client. Then run cordis_inspect_self and activate the plugin only if
hasHostHalf and hasClientHalf are both true.

[host.js starts]
<paste the complete host.js file>
[host.js ends]

[client.js starts]
<paste the complete client.js file>
[client.js ends]
```

### Update an existing installation

Fetch both latest files, call `cordis_define` with `kind: "existing"` and the installed plugin ID, inspect both halves, then call `cordis_run` in update mode. Dynamic packages are replaced as a whole; updating only one half removes the other.

### Verify

- A cost HUD appears around the conversation composer after the session records usage.
- **Settings → Cost Guard** shows pricing, totals, and backup controls.
- Currency values are estimates based on the configured rates. Confirm the rates against your provider bill.

## 简体中文

`dsh-cost-guard` 是包含 Host 与 Web Client 两个半部分的动态 Cordis 包，定义和更新时必须同时提交两个半部分。

### 在线安装提示词

把下面内容发给 DSH：

```text
请安装开源动态 Cordis 插件 dsh-cost-guard：

1. 获取以下两个文件的最新完整内容：
   - https://raw.githubusercontent.com/chenzhiyong1994/dsh-cost-guard/main/host.js
   - https://raw.githubusercontent.com/chenzhiyong1994/dsh-cost-guard/main/client.js
2. 调用 cordis_define：
   - plugin: { kind: "new", idPrefix: "cguard" }
   - code.host：host.js 全文
   - code.client：client.js 全文
3. 对新包调用 cordis_inspect_self，确认 hasHostHalf 与 hasClientHalf 都为
   true。任一半缺失时，立即对 existing 包重新提交两个完整文件，不要运行。
4. 双半检查通过后调用 cordis_run 激活。
5. 告诉我安装后的插件 ID，并说明可在“设置 → 开销监控”中配置。
```

### 离线安装

下载或复制 [`host.js`](../host.js) 与 [`client.js`](../client.js)，把两个完整文件随以下请求发给 DSH：

```text
请创建 idPrefix 为 "cguard" 的动态 Cordis 插件。把下方完整 host.js 作为
code.host，把完整 client.js 作为 code.client。完成后调用
cordis_inspect_self；只有 hasHostHalf 与 hasClientHalf 都为 true 时才激活。

【host.js 开始】
<粘贴完整 host.js>
【host.js 结束】

【client.js 开始】
<粘贴完整 client.js>
【client.js 结束】
```

### 更新现有安装

获取两个最新文件，使用已安装插件 ID 和 `kind: "existing"` 调用 `cordis_define`，检查双半后再以 update 模式调用 `cordis_run`。动态包采用整体替换，只更新一半会删除另一半。

### 验证

- 会话产生 usage 后，输入框附近出现开销横条。
- **设置 → 开销监控** 中可以看到价格、累计和备份设置。
- 金额由配置单价估算，请对照供应商实际账单检查价格。
