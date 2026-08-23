# 反诈智能识别与报案辅助系统 · Firefly-IV
# Anti-Fraud Recognition & Reporting Assistant · Firefly-IV

> 反诈智能识别与报案辅助系统 · Ver.4.3.0-beta ｜ Smart Anti-Fraud Assistant · Ver.4.3.0-beta
> 创意来自东北电力大学易班工作站-Firefly TYPE IV ｜ Concept by NEEPU YiBan Workstation - Firefly TYPE IV

一款面向大学生的智能反诈辅助系统：集关键词检测、OCR 识别、AI 深度判定、刑事控告书自动生成于一体，帮助用户识别诈骗套路、整理报案材料。

An AI-powered anti-fraud assistant for students: combining keyword detection, OCR recognition, AI deep analysis, and one-click criminal complaint drafting to help users identify scam tactics and prepare reporting materials.

> 📖 本 README 提供中英俄三语版本，点击下方标题展开对应语言 ｜ This README is trilingual — click a heading below to expand a language. ｜ Этот README доступен на трёх языках — нажмите на заголовок ниже, чтобы раскрыть нужный язык.

---

<details open>
<summary><b>🇨🇳 中文 / Chinese</b></summary>

### 功能特性

- **🔍 诈骗识别** — 关键词匹配 + Tesseract OCR 本地文字提取 + DeepSeek 深度判定，支持自动脱敏（手机号 / 身份证 / 银行卡）。
- **📝 报案填报** — 三步表单向导，自动生成《刑事控告书》，支持 PDF（宋体排版 + 证据图片）/ TXT 导出与一键复制。
- **📊 账单导入** — 微信 / 支付宝 / 银行 CSV / Excel 账单自动解析，支持多文件上传与合并汇总，智能计算总支出金额并一键导入报案表。
- **💬 AI 智能助手** — DeepSeek 驱动的反诈科普与思政教育对话助手，内置 20 条权威反诈关键词知识库（释义 + 警方提示）。
- **📋 历史记录** — 本地结构化存储，支持查看详情、一键恢复、删除。
- **⚙️ 系统设置** — 自动保存历史、默认开启脱敏。
- **🌙 明暗主题** — 跟随系统 / 手动切换，带过渡动画。
- **🌐 中英俄三语** — 中文 / English / Русский 一键切换，默认中文，选择持久化；覆盖界面与 AI 对话、报案文书等全部生成内容。

### 反诈关键词知识库

系统内置 20 条高频电信网络诈骗关键词，每条含**释义**与**警方提示**，作为 AI 助手科普与识别匹配的依据：

屏幕共享 · 百万保障 · 安全账户 · 修复征信 · 刷单做任务 · 色情小卡片 · 未知链接、二维码 · 境外来电 · 小众聊天软件 · 内幕消息 · NFC 盗刷 · 积分清零 · 快递引流 · 虚拟货币 · 电诈工具人 · 帮信行为 · 两卡 · 现金黄金 · 购物卡 · 刷流水

（内容见 `js/anti-fraud-knowledge.js`，识别匹配字典见 `js/fraud-keywords.js`。）

### 技术栈

| 模块 | 技术 |
|---|---|
| 前端 | 原生 HTML / CSS / JS（无框架，异步加载） |
| 字体 | 汉仪润圆（HYRunYuan）、Kumbh Sans（界面字体）；宋体 SimSun 子集（PDF 导出嵌入） |
| OCR | Tesseract.js 5.x（按需懒加载，语言包缓存至 IndexedDB） |
| 导出 | jsPDF 宋体文本排版（PDF）+ 证据图片附加页、SheetJS/xlsx（账单） |
| 后端 | Cloudflare Pages Functions（`/api/chat` 代理） |
| AI | DeepSeek `deepseek-chat`（兼容 OpenAI 格式） |

### 目录结构

```
-1A/
├── index.html                  # 单页入口（全部页面）
├── css/style.css               # 全局样式与主题 Token
├── js/
│   ├── i18n.js                 # 中英俄三语字典与语言切换
│   ├── app.js                  # 主应用逻辑（表单 / 报案 / 账单 / 历史 / 导航）
│   ├── chat.js                 # AI 聊天（Markdown 渲染、打字指示器）
│   ├── anti-fraud-knowledge.js # 20 条反诈关键词知识库
│   ├── fraud-keywords.js       # 识别匹配字典（按需懒加载）
│   ├── tesseract-loader.js     # OCR 引擎延迟加载
│   ├── upload.js               # 文件上传 + OCR 识别
│   └── utils.js                # 工具（转义 / Markdown / 脱敏 / Toast）
├── functions/api/chat.js       # Cloudflare Pages Function（DeepSeek 代理）
└── fonts/                      # 本地字体文件（含 simsun-subset.ttf 宋体子集）
```

### API 配置

- **默认提供商**：DeepSeek
- **默认模型**：`deepseek-chat`

在 Cloudflare Pages 中设置环境变量：

```
DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx   # 必填
ALLOWED_ORIGINS = https://你的域名        # 可选，跨域白名单（逗号分隔）；不设则仅同源可用
SYSTEM_PROMPT = ...                       # 可选，服务端强制 system 提示词（可缓解提示注入）
```

> 生产环境建议额外在 Cloudflare WAF 中配置速率限制规则，防止接口被滥用盗刷额度。
> 任意兼容 OpenAI 格式的 LLM 服务均可替换接入，修改 `functions/api/chat.js` 中的 API 地址与模型名即可。

### 本地运行

```bash
# 任意静态服务器即可
python -m http.server 8080
# 或
npx serve .
```

> 注意：`/api/chat` 依赖 Cloudflare Pages Functions，本地静态服务器无法调用，需通过 `wrangler pages dev` 或部署后测试 AI 功能；其余功能（识别、OCR、账单、报案、导出）均可本地运行。

### 部署（Cloudflare Pages）

1. 将本仓库推送到 GitHub；
2. 在 Cloudflare Pages 中「创建项目」→「连接到 Git」→ 选择该仓库；
3. 构建命令留空（纯静态），输出目录设为根目录；
4. 在「环境变量」中添加 `DEEPSEEK_API_KEY`；
5. 部署完成，Functions 自动生效。

### ⚠️ 免责声明

本系统由 AI 驱动生成内容，在反诈预警场景中为您提供辅助支持。由于 AI 生成内容可能存在偏差或不准确之处，请您在使用时保持批判性思维，对关键信息进行人工核实与判断。

本项目仅供学习、研究与合法合规的反诈辅助用途。使用者应自行评估生成内容的准确性与适用性，本团队不对因使用本系统产生的任何直接或间接后果承担责任。

### 📜 开源协议

本项目基于 Apache License 2.0（Apache-2.0）协议开源。完整许可文本见仓库根目录 [LICENSE](./LICENSE)，也可在 [SPDX](https://spdx.org/licenses/Apache-2.0.html) 查看。

### 致谢

- 版权所有者：**Xin Firefly-IV**
- 提示词架构师：**Wang A Black**
- UI 设计顾问：**Liu A Green**
- 灵感来源：自动化处理程序
- 项目宗旨：以技术之力服务社会

### 更新日志

- **Ver.4.3.0-beta**（2026-08-23）
  - 📊 账单导入重构：支持一次/多次上传**多个账单文件**（可增删列表、按文件名去重），自动识别**微信 / 支付宝 / 银行**等平台并合并汇总总支出，结果以文件明细 + 合计统计卡展示。
  - 🧾 账单解析增强：动态定位表头行（兼容各平台前置元信息行）、正确处理 CSV 引号内逗号、按「金额列 + 收支列」精确判定支出，并兼容银行「借方/贷方」语义。
  - 🌐 GBK 编码支持：自动探测 CSV 编码（UTF-8 / GBK），兼容老版本微信/支付宝导出。
  - 🐛 修复：账单上传区无法拖拽 CSV、账单表头定位错误导致总额恒为 0、收入行被误判为支出。

- **Ver.4.2.0-beta**（2026-08-22）
  - 🔒 安全加固：`/api/chat` 新增 CORS 白名单（`ALLOWED_ORIGINS`）、IP 滑动窗口速率限制、入参校验与错误脱敏，并支持服务端 `SYSTEM_PROMPT` 注入以缓解提示注入。
  - 🛡️ 隐私保护：识别与 AI 对话外发前按设置自动脱敏（手机号/身份证/银行卡），历史记录与表单草稿落盘前掩码。
  - 🇬🇧 英文识别补齐：新增英文关键词字典，英文模式可正常匹配诈骗关键词；俄语关键词字典去重。
  - 🖼️ 图标系统：emoji 图标全面替换为统一线性 SVG 图标（`currentColor` 描边）；修复桌面导航图标被 CSS 隐藏、图标注入时机提前至脚本加载。
  - 🎨 视觉与无障碍：主题 Token 对比度修正（WCAG）、键盘焦点可见、iOS 输入框防缩放、`prefers-reduced-motion` 增强。
  - 📱 移动端优化：首页 Hero/卡片排版节奏、报案步骤指示器弹性连接线、底部 Dock 触控区放大；俄文标签与首页对话文案精简。
  - 🐛 修复：OCR 文本重复计入、多轮对话 system 提示词被截断、Excel 账单金额解析不一致、银行卡号脱敏正则、Tesseract 加载竞态、身份证校验位缺失；移除冗余 html2canvas 依赖。

- **Ver.4.1.0-beta**（2026-08-21）
  - 🌐 新增俄语版本（三语 zh/en/ru）：完整俄语界面、20 条反诈知识库、关键词检测字典全面俄化；俄语模式 OCR 使用 rus、PDF 嵌入西里尔字体；标题采用「Антимошенническая система」。

- **Ver.4.0.0-beta**（2026-08-16）
  - 📜 开源协议更换：由 MIT 改为 Apache-2.0，新增 LICENSE 文件；README 双语改为可折叠下拉框。
  - 🖼️ 开源徽标：网页徽标更换为 ASF（Apache Software Foundation）logo，系统设置页新增 SPDX logo（链接至 SPDX Apache-2.0 页）。
  - 📱 移动端重构：隐藏顶部标题栏，主题/语言切换改为设置页分段控件，东北电力大学链接移入设置页，主页新增英文切换提示。
  - 🎨 底部 Dock：改为单色线性图标（未选中灰色、选中主题色）。
  - 🔗 新增「易班网」链接（双端设置页）。
  - 🐛 修复：Excel 账单收支列名错误导致总额恒为 0；「生成刑事控告书」第三步必填项未校验；金额校验过宽；OCR 并发锁提前释放；showToast 未转义（XSS 隐患）。

- **Ver.3.10.0**（2026-08-15）
  - 📄 PDF 导出重构：由 html2canvas 截图改为 jsPDF 纯文本排版，正文可选中/复制，字体为宋体（SimSun 子集嵌入）；主标题 22pt 居中加粗、副标题 14pt、区块标题 12pt 加粗、正文 12pt 两端对齐首行缩进 2em、落款右对齐，A4 上下 1.5cm / 左右 2cm 页边距，段落不跨页。
  - 🖼️ 证据图片：上传的证据图片随 PDF 逐张单独成页追加到文末。
  - 🏷️ 系统中文名统一为「反诈智能识别与报案辅助系统」（英文不变）。
  - 🐛 修复：删除证据图片后未同步，导致 PDF 附页与证据计数仍包含已删图片的问题。

- **Ver.3.9.0**（2026-08-15）
  - 🌐 新增中英双语：完整英文界面 + 「中 / 英」切换按钮，默认中文，选择持久化；覆盖 AI 对话、20 条反诈知识库、《刑事控告书》生成等全部动态内容。
  - 🔍 UI 优化：全局字号放大，按钮 / 输入框内边距微调，布局保持不变。

</details>

<details>
<summary><b>🇺🇸 English</b></summary>

### Features

- **🔍 Fraud Detection** — Keyword matching + Tesseract OCR (on-device) + DeepSeek deep analysis, with automatic desensitization (phone number / ID card / bank card).
- **📝 Report Filing** — A three-step form wizard that auto-generates a criminal complaint, with PDF / TXT export and one-click copy.
- **📊 Bill Import** — Auto-parses WeChat / Alipay / bank CSV / Excel statements, supports multiple files with combined totals, and computes total spending with one-click import into the report.
- **💬 AI Assistant** — A DeepSeek-powered anti-fraud education & civic-education chat assistant, backed by a built-in knowledge base of 20 authoritative anti-fraud keywords (definition + police tip).
- **📋 History** — Local structured storage with detail view, one-click restore, and delete.
- **⚙️ Settings** — Auto-save history and default desensitization.
- **🌙 Light / Dark Theme** — System-following or manual toggle with transition animation.
- **🌐 Trilingual (zh / en / ru)** — One-click Chinese/English/Russian toggle (default Chinese, persisted), covering the UI and all generated content such as AI chat and the criminal complaint.

### Anti-Fraud Keyword Knowledge Base

The system ships with 20 high-frequency telecom-fraud keywords, each carrying a **definition** and a **police tip**, used both for AI-assistant education and recognition matching:

Screen sharing · Million guarantee · Safe account · Credit repair · Brushing orders · Pornographic cards · Unknown links / QR codes · Overseas calls · Niche chat apps · Insider information · NFC skimming · Points clearing · Courier-based lead generation · Virtual currency · Fraud "tool person" · Aiding information crimes · "Two cards" · Cash / gold laundering · Gift cards · Fake transaction flow

(Content lives in `js/anti-fraud-knowledge.js`; the matching dictionary lives in `js/fraud-keywords.js`.)

### Tech Stack

| Module | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JS (no framework, async loading) |
| Fonts | HYRunYuan (HanYi RunYuan), Kumbh Sans (UI fonts); SimSun subset (embedded for PDF export) |
| OCR | Tesseract.js 5.x (lazy-loaded, language data cached in IndexedDB) |
| Export | jsPDF SimSun text layout (PDF) + evidence-image appendix, SheetJS/xlsx (statements) |
| Backend | Cloudflare Pages Functions (`/api/chat` proxy) |
| AI | DeepSeek `deepseek-chat` (OpenAI-compatible) |

### Directory Structure

```
-1A/
├── index.html                  # Single-page entry (all pages)
├── css/style.css               # Global styles & theme tokens
├── js/
│   ├── i18n.js                 # Trilingual (zh/en/ru) dictionary & language toggle
│   ├── app.js                  # Core logic (forms / report / bill / history / nav)
│   ├── chat.js                 # AI chat (Markdown rendering, typing indicator)
│   ├── anti-fraud-knowledge.js # 20 anti-fraud keyword knowledge entries
│   ├── fraud-keywords.js       # Matching dictionary (lazy-loaded)
│   ├── tesseract-loader.js     # OCR engine lazy loader
│   ├── upload.js               # File upload + OCR recognition
│   └── utils.js                # Utilities (escape / Markdown / desensitize / Toast)
├── functions/api/chat.js       # Cloudflare Pages Function (DeepSeek proxy)
└── fonts/                      # Local font files (incl. simsun-subset.ttf SimSun subset)
```

### API Configuration

- **Default provider**: DeepSeek
- **Default model**: `deepseek-chat`

Set the environment variables in Cloudflare Pages:

```
DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx   # required
ALLOWED_ORIGINS = https://your-domain    # optional, cross-origin allowlist (comma-separated); same-origin only if unset
SYSTEM_PROMPT = ...                      # optional, server-enforced system prompt (mitigates prompt injection)
```

> For production, also configure a rate-limiting rule in Cloudflare WAF to prevent API abuse.
> Any OpenAI-compatible LLM service can be swapped in — edit the API endpoint and model name in `functions/api/chat.js`.

### Local Development

```bash
# Any static server will do
python -m http.server 8080
# or
npx serve .
```

> Note: `/api/chat` depends on Cloudflare Pages Functions and cannot be called from a plain static server. Use `wrangler pages dev` or test after deployment for AI features. Everything else (detection, OCR, bill import, report, export) works locally.

### Deployment (Cloudflare Pages)

1. Push this repository to GitHub;
2. In Cloudflare Pages, click **Create project → Connect to Git** and select the repo;
3. Leave the build command empty (pure static) and set the output directory to the root;
4. Add the `DEEPSEEK_API_KEY` environment variable;
5. Deploy — Functions take effect automatically.

### ⚠️ Disclaimer

This system generates AI-assisted content to support anti-fraud prevention. Since AI-generated content may contain inaccuracies or biases, please exercise critical thinking and independently verify any critical information before acting on it.

This project is intended solely for educational, research, and legitimate anti-fraud assistance purposes. Users are responsible for evaluating the accuracy and applicability of the generated content. The project team assumes no liability for any direct or indirect consequences arising from the use of this system.

### 📜 License

Released under the Apache License 2.0 (Apache-2.0). See the [LICENSE](./LICENSE) file in the repository root, or the [SPDX entry](https://spdx.org/licenses/Apache-2.0.html).

### Acknowledgements

- Copyright Owner: **Xin Firefly-IV**
- Prompt Architect: **Wang A Black**
- UI Design Advisor: **Liu A Green**
- Inspiration: Automation Processing Pipeline
- Mission: Serving society through technology

### Changelog

- **Ver.4.3.0-beta** (2026-08-23)
  - 📊 Bill import rework: upload **multiple statements** at once or over time (add/remove list, dedupe by filename), auto-detect **WeChat / Alipay / bank** platforms, and merge into a combined total shown as a per-file breakdown plus summary cards.
  - 🧾 Parsing improvements: locate the header row dynamically (handles the meta rows prepended by each platform), correctly handle quoted commas in CSV, and determine expenses precisely from the amount + direction columns, including bank "debit/credit" semantics.
  - 🌐 GBK support: auto-detect CSV encoding (UTF-8 / GBK) for legacy WeChat/Alipay exports.
  - 🐛 Fixes: CSV drag-and-drop into the bill area did nothing, the header was misdetected so the total was always 0, and income rows could be miscounted as expenses.

- **Ver.4.2.0-beta** (2026-08-22)
  - 🔒 Security hardening: `/api/chat` now has a CORS allowlist (`ALLOWED_ORIGINS`), IP sliding-window rate limiting, input validation and error sanitization, plus server-side `SYSTEM_PROMPT` injection to mitigate prompt injection.
  - 🛡️ Privacy: outbound text in detection and AI chat is auto-desensitized (phone/ID/bank card) per settings; history records and form drafts are masked before storage.
  - 🇬🇧 English detection: added the English keyword dictionary so English mode matches fraud keywords; deduplicated Russian keywords.
  - 🖼️ Icon system: replaced emoji icons with a unified line-style SVG icon set (`currentColor` stroke); fixed desktop navigation icons being hidden by CSS, and moved icon injection earlier to script load.
  - 🎨 Visual & accessibility: theme token contrast fixes (WCAG), visible keyboard focus, iOS input focus-zoom prevention, enhanced `prefers-reduced-motion`.
  - 📱 Mobile: home hero/card rhythm, flexible step-indicator connectors, larger bottom-dock touch targets; tightened Russian dock labels and home chat copy.
  - 🐛 Fixes: duplicate OCR text, truncated system prompt in long chats, inconsistent Excel amount parsing, bank-card desensitization regex, Tesseract load race, missing ID checksum; removed the redundant html2canvas dependency.

- **Ver.4.1.0-beta** (2026-08-21)
  - 🌐 Added the Russian version (trilingual zh/en/ru): full Russian UI, the 20-entry knowledge base, and the keyword-detection dictionary are fully Russian-ized; Russian mode uses `rus` for OCR and embeds a Cyrillic font for PDF; the title is「Антимошенническая система」.

- **Ver.4.0.0-beta** (2026-08-16)
  - 📜 License change: switched from MIT to Apache-2.0, added a LICENSE file; the bilingual README sections are now collapsible dropdowns.
  - 🖼️ Open-source badges: replaced with the ASF (Apache Software Foundation) logo, and added an SPDX logo on the Settings page (linking to the SPDX Apache-2.0 page).
  - 📱 Mobile rework: hidden the top header bar, moved theme/language toggles into Settings as segmented controls, moved the NEEPU link into Settings, and added an English hint on the home page.
  - 🎨 Bottom dock: switched to monochrome line icons (gray when unselected, theme color when selected).
  - 🔗 Added a "Yiban" link (both desktop and mobile Settings).
  - 🐛 Fixes: Excel statement direction-column mismatch (total was always 0); missing step-3 validation on report generation; overly-lenient amount validation; premature OCR concurrency-lock release; unescaped showToast message (XSS risk).

- **Ver.3.10.0** (2026-08-15)
  - 📄 PDF export rewritten: switched from an html2canvas screenshot to native jsPDF text layout (selectable/copyable text) with an embedded SimSun subset; title 22pt centered bold, subtitle 14pt, section headings 12pt bold, body 12pt justified with a 2em first-line indent, and a right-aligned signature block; A4 with 1.5cm top/bottom and 2cm left/right margins, paragraphs kept intact across pages.
  - 🖼️ Evidence images appended as one page per image at the end of the PDF.
  - 🏷️ Unified the Chinese product name to「反诈智能识别与报案辅助系统」(English unchanged).
  - 🐛 Fixed: deleting an evidence image no longer leaves it in the PDF appendix or evidence count.

- **Ver.3.9.0** (2026-08-15)
  - 🌐 Added Chinese/English bilingual support: full English UI with a zh/en toggle (default Chinese, persisted), covering AI chat, the 20-entry knowledge base, the generated criminal complaint, and all other dynamic content.
  - 🔍 UI polish: larger global font sizes and slightly increased button/input padding (layout unchanged).

</details>

<details>
<summary><b>🇷🇺 Русский</b></summary>

### Возможности

- **🔍 Распознавание мошенничества** — поиск по ключевым словам + локальное извлечение текста Tesseract OCR + глубокая оценка DeepSeek, с автоматическим обезличиванием (номер телефона / удостоверение личности / банковская карта).
- **📝 Подача заявления** — трёхшаговый мастер форм с автоматическим составлением заявления о преступлении и экспортом в PDF (вёрстка шрифтом SimSun + изображения доказательств) / TXT, а также копированием в один клик.
- **📊 Импорт выписки** — автоматический разбор выписок WeChat / Alipay / банка в формате CSV / Excel, поддержка нескольких файлов с объединением итогов, расчёт общей суммы расходов и импорт в форму заявления в один клик.
- **💬 ИИ-ассистент** — диалоговый ассистент по антимошенническому просвещению и гражданско-правовому воспитанию на базе DeepSeek, со встроенной базой из 20 авторитетных ключевых слов о мошенничестве (определение + совет полиции).
- **📋 История** — локальное структурированное хранение с просмотром подробностей, восстановлением в один клик и удалением.
- **⚙️ Настройки** — автосохранение истории и включённое по умолчанию обезличивание.
- **🌙 Светлая / тёмная тема** — следование за системой или ручное переключение с анимацией перехода.
- **🌐 Три языка (zh / en / ru)** — переключение китайского / английского / русского в один клик (по умолчанию китайский, выбор сохраняется); охватывает интерфейс и весь генерируемый контент, включая диалог с ИИ и заявление о преступлении.

### База знаний о ключевых словах мошенничества

Система включает 20 высокочастотных ключевых слов телекоммуникационного и сетевого мошенничества, каждое с **определением** и **советом полиции**, используемых для просвещения ИИ-ассистента и сопоставления при распознавании:

Демонстрация экрана · «Гарантия на миллион» · «Безопасный счёт» · Исправление кредитной истории · Накрутка заказов · Порнографические карточки · Неизвестные ссылки / QR-коды · Звонки из-за рубежа · Малоизвестные мессенджеры · Инсайдерская информация · Скимминг через NFC · Обнуление баллов · Привлечение через посылки · Виртуальная валюта · «Инструмент» мошенников · Пособничество информационным преступлениям · «Две карты» · Наличные / золото · Подарочные карты · Накрутка оборотов по счёту

(Контент находится в `js/anti-fraud-knowledge.js`; словарь сопоставления — в `js/fraud-keywords.js`.)

### Технологический стек

| Модуль | Технология |
|---|---|
| Frontend | Нативный HTML / CSS / JS (без фреймворков, асинхронная загрузка) |
| Fonts | HYRunYuan (HanYi RunYuan), Kumbh Sans (интерфейс); подмножество SimSun (встраивается в экспортируемый PDF), DejaVu Sans (русский интерфейс и PDF) |
| OCR | Tesseract.js 5.x (ленивая загрузка, языковые пакеты кэшируются в IndexedDB) |
| Export | jsPDF: текстовая вёрстка SimSun (PDF) + страницы с изображениями доказательств, SheetJS/xlsx (выписки) |
| Backend | Cloudflare Pages Functions (`/api/chat` proxy) |
| AI | DeepSeek `deepseek-chat` (совместимо с OpenAI) |

### Структура каталогов

```
-1A/
├── index.html                  # Одностраничная точка входа (все страницы)
├── css/style.css               # Глобальные стили и токены тем
├── js/
│   ├── i18n.js                 # Словари zh / en / ru и переключение языка
│   ├── app.js                  # Основная логика (формы / заявление / выписка / история / навигация)
│   ├── chat.js                 # ИИ-чат (рендеринг Markdown, индикатор набора)
│   ├── anti-fraud-knowledge.js # База из 20 ключевых слов (zh/en/ru)
│   ├── fraud-keywords.js       # Словари сопоставления (zh/en/ru, ленивая загрузка)
│   ├── tesseract-loader.js     # Отложенная загрузка движка OCR
│   ├── upload.js               # Загрузка файлов + распознавание OCR
│   └── utils.js                # Утилиты (экранирование / Markdown / обезличивание / Toast)
├── functions/api/chat.js       # Cloudflare Pages Function (прокси DeepSeek)
└── fonts/                      # Локальные шрифты (включая simsun-subset.ttf и dejavu-sans-subset.ttf)
```

### Конфигурация API

- **Провайдер по умолчанию**: DeepSeek
- **Модель по умолчанию**: `deepseek-chat`

Установите переменные окружения в Cloudflare Pages:

```
DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx   # обязательно
ALLOWED_ORIGINS = https://ваш-домен      # опционально, белый список источников (через запятую); без него — только тот же источник
SYSTEM_PROMPT = ...                      # опционально, принудительный system-промпт на сервере (снижает риск инъекции)
```

> Для продакшена дополнительно настройте правило ограничения частоты запросов в Cloudflare WAF, чтобы предотвратить злоупотребление.
> Можно подключить любой LLM-сервис, совместимый с форматом OpenAI, изменив адрес API и имя модели в `functions/api/chat.js`.

### Локальный запуск

```bash
# Подойдёт любой статический сервер
python -m http.server 8080
# или
npx serve .
```

> Примечание: `/api/chat` зависит от Cloudflare Pages Functions и не может быть вызван из обычного статического сервера. Для проверки функций ИИ используйте `wrangler pages dev` или тестируйте после развёртывания; остальные функции (распознавание, OCR, выписки, заявление, экспорт) работают локально.

### Развёртывание (Cloudflare Pages)

1. Отправьте репозиторий на GitHub;
2. В Cloudflare Pages нажмите **Create project → Connect to Git** и выберите репозиторий;
3. Оставьте команду сборки пустой (чистая статика), укажите корневой каталог в качестве выходного;
4. Добавьте переменную окружения `DEEPSEEK_API_KEY`;
5. Разверните — функции вступают в силу автоматически.

### ⚠️ Отказ от ответственности

Система генерирует контент с помощью ИИ и оказывает вспомогательную поддержку в сценариях предупреждения о мошенничестве. Поскольку контент, генерируемый ИИ, может содержать неточности или ошибки, сохраняйте критическое мышление и самостоятельно проверяйте важную информацию.

Проект предназначен исключительно для учебных, исследовательских и законных целей помощи в борьбе с мошенничеством. Пользователи самостоятельно оценивают точность и применимость генерируемого контента; команда проекта не несёт ответственности за любые прямые или косвенные последствия использования системы.

### 📜 Лицензия

Проект распространяется по лицензии Apache License 2.0 (Apache-2.0). Полный текст лицензии — в [LICENSE](./LICENSE), а также на [SPDX](https://spdx.org/licenses/Apache-2.0.html).

### Благодарности

- Владелец авторских прав: **Xin Firefly-IV**
- Архитектор подсказок: **Wang A Black**
- Консультант по UI-дизайну: **Liu A Green**
- Вдохновение: конвейер автоматической обработки
- Миссия: служение обществу через технологии

### Журнал изменений

- **Ver.4.3.0-beta** (2026-08-23)
  - 📊 Переработка импорта выписок: загрузка **нескольких выписок** одновременно или постепенно (список с добавлением/удалением, дедупликация по имени файла), автоматическое определение платформы **WeChat / Alipay / банк** и объединение в общий итог с разбивкой по файлам и итоговыми карточками.
  - 🧾 Улучшение разбора: динамический поиск строки заголовка (учёт мета-строк в начале выписок), корректная обработка запятых внутри кавычек CSV, точное определение расходов по столбцам суммы и направления, включая семантику банковских «дебет/кредит».
  - 🌐 Поддержка GBK: автоматическое определение кодировки CSV (UTF-8 / GBK) для старых экспортов WeChat/Alipay.
  - 🐛 Исправления: перетаскивание CSV в область выписок не работало, неверное определение заголовка приводило к нулевой сумме, строки доходов могли ошибочно считаться расходами.

- **Ver.4.2.0-beta** (2026-08-22)
  - 🔒 Усиление безопасности: `/api/chat` получил белый список CORS (`ALLOWED_ORIGINS`), скользящее окно ограничения частоты по IP, проверку ввода и экранирование ошибок, а также серверную инъекцию `SYSTEM_PROMPT` для снижения риска инъекций.
  - 🛡️ Приватность: исходящий текст в распознавании и ИИ-чате автоматически обезличивается (телефон/удостоверение/карта) согласно настройкам; история и черновики форм маскируются перед сохранением.
  - 🇬🇧 Английское распознавание: добавлен английский словарь ключевых слов, поэтому английский режим корректно находит ключевые слова; удалены дубликаты в русском словаре.
  - 🖼️ Система иконок: emoji-иконки полностью заменены единым набором линейных SVG (`currentColor`); исправлено скрытие иконок навигации на десктопе через CSS, момент внедрения иконок перенесён на этап загрузки скриптов.
  - 🎨 Визуал и доступность: исправлен контраст токенов тем (WCAG), видимый фокус клавиатуры, защита от зума при фокусе на iOS, улучшен `prefers-reduced-motion`.
  - 📱 Мобильная версия: ритм hero/карточек, гибкие соединители шагового индикатора, увеличенные зоны касания нижней панели; сокращены русские подписи панели и текст чата на главной.
  - 🐛 Исправления: дублирование OCR-текста, обрезка system-промпта в длинных диалогах, несогласованный разбор сумм Excel, регулярное выражение обезличивания банковских карт, гонка загрузки Tesseract, отсутствие контрольной цифры удостоверения; удалена избыточная зависимость html2canvas.

- **Ver.4.1.0-beta** (2026-08-21)
  - 🌐 Добавлена русская версия (три языка zh/en/ru): полный русский интерфейс, база из 20 ключевых слов и словарь обнаружения по ключевым словам полностью переведены на русский; в русском режиме OCR использует `rus`, а в PDF встраивается кириллический шрифт; заголовок — «Антимошенническая система».

- **Ver.4.0.0-beta** (2026-08-16)
  - 📜 Смена лицензии: с MIT на Apache-2.0, добавлен файл LICENSE; двуязычный README преобразован в раскрывающиеся блоки.
  - 🖼️ Значки открытого кода: заменены на логотип ASF (Apache Software Foundation), на странице настроек добавлен логотип SPDX (ссылка на страницу SPDX Apache-2.0).
  - 📱 Мобильная переработка: скрыта верхняя строка заголовка, переключатели темы/языка вынесены в настройки в виде сегментированных элементов, ссылка на NEEPU перенесена в настройки, на главной странице добавлена подсказка о переключении языка.
  - 🎨 Нижняя панель: одноцветные линейные иконки (серые при невыбранном, цвет темы при выбранном).
  - 🔗 Добавлена ссылка «Ибань» (настройки для настольных и мобильных устройств).
  - 🐛 Исправления: неверное имя столбца доходов/расходов в Excel (сумма всегда была 0); отсутствие проверки обязательных полей на третьем шаге; излишне мягкая проверка суммы; преждевременное снятие блокировки конкурентного OCR; неэкранированный showToast (риск XSS).

- **Ver.3.10.0** (2026-08-15)
  - 📄 Переработка экспорта PDF: вместо скриншота html2canvas — нативная текстовая вёрстка jsPDF (выделяемый/копируемый текст) со встроенным подмножеством SimSun; заголовок 22pt по центру жирным, подзаголовок 14pt, заголовки разделов 12pt жирным, основной текст 12pt по ширине с отступом первой строки 2em, блок подписи по правому краю; A4 с полями 1,5 см сверху/снизу и 2 см слева/справа, абзацы не разрываются между страницами.
  - 🖼️ Изображения доказательств добавляются по одному на страницу в конце PDF.
  - 🏷️ Китайское название системы унифицировано как «反诈智能识别与报案辅助系统» (английское не изменилось).
  - 🐛 Исправлено: удаление изображения доказательства больше не оставляет его в приложении PDF или счётчике доказательств.

- **Ver.3.9.0** (2026-08-15)
  - 🌐 Добавлена двуязычная поддержка: полный английский интерфейс с кнопкой переключения zh/en (по умолчанию китайский, выбор сохраняется), охватывающая диалог с ИИ, базу из 20 ключевых слов, генерируемое заявление о преступлении и весь прочий динамический контент.
  - 🔍 Полировка UI: увеличены глобальные размеры шрифта и слегка увеличены внутренние отступы кнопок/полей (раскладка не изменилась).

</details>

---

© 2026 Xin Firefly-IV. Licensed under Apache-2.0. · Ver.4.3.0-beta
