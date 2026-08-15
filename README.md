# 反诈智能识别与报案辅助系统 · Firefly-IV

> 智能反诈辅助系统 · Ver.3.8.1
> 创意来自东北电力大学易班工作站-Firefly TYPE IV

一款面向大学生的智能反诈辅助系统：集关键词检测、OCR 识别、AI 深度判定、刑事控告书自动生成于一体，帮助用户识别诈骗套路、整理报案材料。

---

## 功能特性

- **🔍 诈骗识别** — 关键词匹配 + Tesseract OCR 本地文字提取 + DeepSeek 深度判定，支持自动脱敏（手机号 / 身份证 / 银行卡）。
- **📝 报案填报** — 三步表单向导，自动生成《刑事控告书》，支持 PDF / TXT 导出与一键复制。
- **📊 账单导入** — 微信 / 支付宝 CSV / Excel 账单自动解析，智能计算总支出金额并一键导入报案表。
- **💬 AI 智能助手** — DeepSeek 驱动的反诈科普与思政教育对话助手，内置 20 条权威反诈关键词知识库（释义 + 警方提示）。
- **📋 历史记录** — 本地结构化存储，支持查看详情、一键恢复、删除。
- **⚙️ 系统设置** — 自动保存历史、默认开启脱敏。
- **🌙 明暗主题** — 跟随系统 / 手动切换，带过渡动画。

## 反诈关键词知识库

系统内置 20 条高频电信网络诈骗关键词，每条含**释义**与**警方提示**，作为 AI 助手科普与识别匹配的依据：

屏幕共享 · 百万保障 · 安全账户 · 修复征信 · 刷单做任务 · 色情小卡片 · 未知链接、二维码 · 境外来电 · 小众聊天软件 · 内幕消息 · NFC 盗刷 · 积分清零 · 快递引流 · 虚拟货币 · 电诈工具人 · 帮信行为 · 两卡 · 现金黄金 · 购物卡 · 刷流水

（内容见 `js/anti-fraud-knowledge.js`，识别匹配字典见 `js/fraud-keywords.js`。）

## 技术栈

| 模块 | 技术 |
|---|---|
| 前端 | 原生 HTML / CSS / JS（无框架，异步加载） |
| 字体 | 汉仪润圆（HYRunYuan）、Kumbh Sans（本地字体，`font-display: optional`） |
| OCR | Tesseract.js 5.x（按需懒加载，语言包缓存至 IndexedDB） |
| 导出 | html2canvas + jsPDF（PDF）、SheetJS/xlsx（账单） |
| 后端 | Cloudflare Pages Functions（`/api/chat` 代理） |
| AI | DeepSeek `deepseek-chat`（兼容 OpenAI 格式） |

## 目录结构

```
-1A/
├── index.html                  # 单页入口（全部页面）
├── css/style.css               # 全局样式与主题 Token
├── js/
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

## API 配置

- **默认提供商**：DeepSeek
- **默认模型**：`deepseek-chat`

在 Cloudflare Pages 中设置环境变量：

```
DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx
```

> 任意兼容 OpenAI 格式的 LLM 服务均可替换接入，修改 `functions/api/chat.js` 中的 API 地址与模型名即可。

## 本地运行

```bash
# 任意静态服务器即可
python -m http.server 8080
# 或
npx serve .
```

> 注意：`/api/chat` 依赖 Cloudflare Pages Functions，本地静态服务器无法调用，需通过 `wrangler pages dev` 或部署后测试 AI 功能；其余功能（识别、OCR、账单、报案、导出）均可本地运行。

## 部署（Cloudflare Pages）

1. 将本仓库推送到 GitHub；
2. 在 Cloudflare Pages 中「创建项目」→「连接到 Git」→ 选择该仓库；
3. 构建命令留空（纯静态），输出目录设为根目录；
4. 在「环境变量」中添加 `DEEPSEEK_API_KEY`；
5. 部署完成，Functions 自动生效。

## ⚠️ 免责声明

本系统由 AI 驱动生成内容，在反诈预警场景中为您提供辅助支持。由于 AI 生成内容可能存在偏差或不准确之处，请您在使用时保持批判性思维，对关键信息进行人工核实与判断。

本项目仅供学习、研究与合法合规的反诈辅助用途。使用者应自行评估生成内容的准确性与适用性，本团队不对因使用本系统产生的任何直接或间接后果承担责任。

## 📜 开源协议

本项目基于 MIT 协议开源，您可以自由使用、修改和分发，但请保留原始版权声明及作者署名。

```text
Copyright (C) 2026 Xin Firefly-IV

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## 致谢

- 版权所有者：**Xin Firefly-IV**
- 提示词架构师：**Wang A Black**
- UI 设计顾问：**Liu A Green**
- 灵感来源：自动化处理程序
- 项目宗旨：以技术之力服务社会

---

© 2026 Xin Firefly-IV. All Rights Reserved. · Ver.3.8.1
