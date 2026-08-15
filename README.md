# 反诈智能识别与报案辅助系统 · Firefly-IV
# Anti-Fraud Recognition & Reporting Assistant · Firefly-IV

> 智能反诈辅助系统 · Ver.3.9.0 ｜ Smart Anti-Fraud Assistant · Ver.3.9.0
> 创意来自东北电力大学易班工作站-Firefly TYPE IV ｜ Concept by NEEPU YiBan Workstation - Firefly TYPE IV

一款面向大学生的智能反诈辅助系统：集关键词检测、OCR 识别、AI 深度判定、刑事控告书自动生成于一体，帮助用户识别诈骗套路、整理报案材料。

An AI-powered anti-fraud assistant for students: combining keyword detection, OCR recognition, AI deep analysis, and one-click criminal complaint drafting to help users identify scam tactics and prepare reporting materials.

> 📖 本 README 提供中英双语版本 ｜ This README is available in both Chinese and English.

---

## 中文 / Chinese

### 功能特性

- **🔍 诈骗识别** — 关键词匹配 + Tesseract OCR 本地文字提取 + DeepSeek 深度判定，支持自动脱敏（手机号 / 身份证 / 银行卡）。
- **📝 报案填报** — 三步表单向导，自动生成《刑事控告书》，支持 PDF / TXT 导出与一键复制。
- **📊 账单导入** — 微信 / 支付宝 CSV / Excel 账单自动解析，智能计算总支出金额并一键导入报案表。
- **💬 AI 智能助手** — DeepSeek 驱动的反诈科普与思政教育对话助手，内置 20 条权威反诈关键词知识库（释义 + 警方提示）。
- **📋 历史记录** — 本地结构化存储，支持查看详情、一键恢复、删除。
- **⚙️ 系统设置** — 自动保存历史、默认开启脱敏。
- **🌙 明暗主题** — 跟随系统 / 手动切换，带过渡动画。
- **🌐 中英双语** — 中文 / 英文一键切换，默认中文，选择持久化；覆盖界面与 AI 对话、报案文书等全部生成内容。

### 反诈关键词知识库

系统内置 20 条高频电信网络诈骗关键词，每条含**释义**与**警方提示**，作为 AI 助手科普与识别匹配的依据：

屏幕共享 · 百万保障 · 安全账户 · 修复征信 · 刷单做任务 · 色情小卡片 · 未知链接、二维码 · 境外来电 · 小众聊天软件 · 内幕消息 · NFC 盗刷 · 积分清零 · 快递引流 · 虚拟货币 · 电诈工具人 · 帮信行为 · 两卡 · 现金黄金 · 购物卡 · 刷流水

（内容见 `js/anti-fraud-knowledge.js`，识别匹配字典见 `js/fraud-keywords.js`。）

### 技术栈

| 模块 | 技术 |
|---|---|
| 前端 | 原生 HTML / CSS / JS（无框架，异步加载） |
| 字体 | 汉仪润圆（HYRunYuan）、Kumbh Sans（本地字体，`font-display: optional`） |
| OCR | Tesseract.js 5.x（按需懒加载，语言包缓存至 IndexedDB） |
| 导出 | html2canvas + jsPDF（PDF）、SheetJS/xlsx（账单） |
| 后端 | Cloudflare Pages Functions（`/api/chat` 代理） |
| AI | DeepSeek `deepseek-chat`（兼容 OpenAI 格式） |

### 目录结构

```
-1A/
├── index.html                  # 单页入口（全部页面）
├── css/style.css               # 全局样式与主题 Token
├── js/
│   ├── i18n.js                 # 中英双语字典与语言切换
│   ├── app.js                  # 主应用逻辑（表单 / 报案 / 账单 / 历史 / 导航）
│   ├── chat.js                 # AI 聊天（Markdown 渲染、打字指示器）
│   ├── anti-fraud-knowledge.js # 20 条反诈关键词知识库
│   ├── fraud-keywords.js       # 识别匹配字典（按需懒加载）
│   ├── tesseract-loader.js     # OCR 引擎延迟加载
│   ├── upload.js               # 文件上传 + OCR 识别
│   └── utils.js                # 工具（转义 / Markdown / 脱敏 / Toast）
├── functions/api/chat.js       # Cloudflare Pages Function（DeepSeek 代理）
├── fonts/                      # 本地字体文件
└── dist/                       # 构建副本（已过期，仅供参考）
```

### API 配置

- **默认提供商**：DeepSeek
- **默认模型**：`deepseek-chat`

在 Cloudflare Pages 中设置环境变量：

```
DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx
```

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

本项目基于 MIT 协议开源，您可以自由使用、修改和分发，但请保留原始版权声明及作者署名。

```text
Copyright (C) 2026 Xin Firefly-IV

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### 致谢

- 版权所有者：**Xin Firefly-IV**
- 提示词架构师：**Wang A Black**
- UI 设计顾问：**Liu A Green**
- 灵感来源：自动化处理程序
- 项目宗旨：以技术之力服务社会

### 更新日志

- **Ver.3.9.0**（2026-08-15）
  - 🌐 新增中英双语：完整英文界面 + 「中 / 英」切换按钮，默认中文，选择持久化；覆盖 AI 对话、20 条反诈知识库、《刑事控告书》生成等全部动态内容。
  - 🔍 UI 优化：全局字号放大，按钮 / 输入框内边距微调，布局保持不变。

---

## English

### Features

- **🔍 Fraud Detection** — Keyword matching + Tesseract OCR (on-device) + DeepSeek deep analysis, with automatic desensitization (phone number / ID card / bank card).
- **📝 Report Filing** — A three-step form wizard that auto-generates a criminal complaint, with PDF / TXT export and one-click copy.
- **📊 Bill Import** — Auto-parses WeChat / Alipay CSV / Excel statements and computes total spending, with one-click import into the report.
- **💬 AI Assistant** — A DeepSeek-powered anti-fraud education & civic-education chat assistant, backed by a built-in knowledge base of 20 authoritative anti-fraud keywords (definition + police tip).
- **📋 History** — Local structured storage with detail view, one-click restore, and delete.
- **⚙️ Settings** — Auto-save history and default desensitization.
- **🌙 Light / Dark Theme** — System-following or manual toggle with transition animation.
- **🌐 Bilingual (zh / en)** — One-click Chinese/English toggle (default Chinese, persisted), covering the UI and all generated content such as AI chat and the criminal complaint.

### Anti-Fraud Keyword Knowledge Base

The system ships with 20 high-frequency telecom-fraud keywords, each carrying a **definition** and a **police tip**, used both for AI-assistant education and recognition matching:

Screen sharing · Million guarantee · Safe account · Credit repair · Brushing orders · Pornographic cards · Unknown links / QR codes · Overseas calls · Niche chat apps · Insider information · NFC skimming · Points clearing · Courier-based lead generation · Virtual currency · Fraud "tool person" · Aiding information crimes · "Two cards" · Cash / gold laundering · Gift cards · Fake transaction flow

(Content lives in `js/anti-fraud-knowledge.js`; the matching dictionary lives in `js/fraud-keywords.js`.)

### Tech Stack

| Module | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JS (no framework, async loading) |
| Fonts | HYRunYuan (HanYi RunYuan), Kumbh Sans (local, `font-display: optional`) |
| OCR | Tesseract.js 5.x (lazy-loaded, language data cached in IndexedDB) |
| Export | html2canvas + jsPDF (PDF), SheetJS/xlsx (statements) |
| Backend | Cloudflare Pages Functions (`/api/chat` proxy) |
| AI | DeepSeek `deepseek-chat` (OpenAI-compatible) |

### Directory Structure

```
-1A/
├── index.html                  # Single-page entry (all pages)
├── css/style.css               # Global styles & theme tokens
├── js/
│   ├── i18n.js                 # Bilingual (zh/en) dictionary & language toggle
│   ├── app.js                  # Core logic (forms / report / bill / history / nav)
│   ├── chat.js                 # AI chat (Markdown rendering, typing indicator)
│   ├── anti-fraud-knowledge.js # 20 anti-fraud keyword knowledge entries
│   ├── fraud-keywords.js       # Matching dictionary (lazy-loaded)
│   ├── tesseract-loader.js     # OCR engine lazy loader
│   ├── upload.js               # File upload + OCR recognition
│   └── utils.js                # Utilities (escape / Markdown / desensitize / Toast)
├── functions/api/chat.js       # Cloudflare Pages Function (DeepSeek proxy)
├── fonts/                      # Local font files
└── dist/                       # Stale build copy (reference only)
```

### API Configuration

- **Default provider**: DeepSeek
- **Default model**: `deepseek-chat`

Set the environment variable in Cloudflare Pages:

```
DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx
```

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

Released under the MIT License. You are free to use, modify, and distribute it, provided you retain the original copyright notice and attribution.

```text
Copyright (C) 2026 Xin Firefly-IV

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### Acknowledgements

- Copyright Owner: **Xin Firefly-IV**
- Prompt Architect: **Wang A Black**
- UI Design Advisor: **Liu A Green**
- Inspiration: Automation Processing Pipeline
- Mission: Serving society through technology

### Changelog

- **Ver.3.9.0** (2026-08-15)
  - 🌐 Added Chinese/English bilingual support: full English UI with a zh/en toggle (default Chinese, persisted), covering AI chat, the 20-entry knowledge base, the generated criminal complaint, and all other dynamic content.
  - 🔍 UI polish: larger global font sizes and slightly increased button/input padding (layout unchanged).

---

© 2026 Xin Firefly-IV. All Rights Reserved. · Ver.3.9.0
