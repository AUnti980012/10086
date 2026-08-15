# Anti-Fraud Recognition & Reporting Assistant · Firefly-IV

> Smart Anti-Fraud Assistant · Ver.3.8.1
> Concept by NEEPU Easy-Ban Workstation - Firefly TYPE IV

An AI-powered anti-fraud assistant for students: combining keyword detection, OCR recognition, AI deep analysis, and one-click criminal complaint drafting to help users identify scam tactics and prepare reporting materials.

---

## Features

- **🔍 Fraud Detection** — Keyword matching + Tesseract OCR (on-device) + DeepSeek deep analysis, with automatic desensitization (phone number / ID card / bank card).
- **📝 Report Filing** — A three-step form wizard that auto-generates a criminal complaint, with PDF / TXT export and one-click copy.
- **📊 Bill Import** — Auto-parses WeChat / Alipay CSV / Excel statements and computes total spending, with one-click import into the report.
- **💬 AI Assistant** — A DeepSeek-powered anti-fraud education & civic-education chat assistant, backed by a built-in knowledge base of 20 authoritative anti-fraud keywords (definition + police tip).
- **📋 History** — Local structured storage with detail view, one-click restore, and delete.
- **⚙️ Settings** — Auto-save history and default desensitization.
- **🌙 Light / Dark Theme** — System-following or manual toggle with transition animation.

## Anti-Fraud Keyword Knowledge Base

The system ships with 20 high-frequency telecom-fraud keywords, each carrying a **definition** and a **police tip**, used both for AI-assistant education and recognition matching:

Screen sharing · Million guarantee · Safe account · Credit repair · Brushing orders · Pornographic cards · Unknown links / QR codes · Overseas calls · Niche chat apps · Insider information · NFC skimming · Points clearing · Courier-based lead generation · Virtual currency · Fraud "tool person" · Aiding information crimes · "Two cards" · Cash / gold laundering · Gift cards · Fake transaction flow

(Content lives in `js/anti-fraud-knowledge.js`; the matching dictionary lives in `js/fraud-keywords.js`.)

## Tech Stack

| Module | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JS (no framework, async loading) |
| Fonts | HYRunYuan (HanYi RunYuan), Kumbh Sans (local, `font-display: optional`) |
| OCR | Tesseract.js 5.x (lazy-loaded, language data cached in IndexedDB) |
| Export | html2canvas + jsPDF (PDF), SheetJS/xlsx (statements) |
| Backend | Cloudflare Pages Functions (`/api/chat` proxy) |
| AI | DeepSeek `deepseek-chat` (OpenAI-compatible) |

## Directory Structure

```
-1A/
├── index.html                  # Single-page entry (all pages)
├── css/style.css               # Global styles & theme tokens
├── js/
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

## API Configuration

- **Default provider**: DeepSeek
- **Default model**: `deepseek-chat`

Set the environment variable in Cloudflare Pages:

```
DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx
```

> Any OpenAI-compatible LLM service can be swapped in — edit the API endpoint and model name in `functions/api/chat.js`.

## Local Development

```bash
# Any static server will do
python -m http.server 8080
# or
npx serve .
```

> Note: `/api/chat` depends on Cloudflare Pages Functions and cannot be called from a plain static server. Use `wrangler pages dev` or test after deployment for AI features. Everything else (detection, OCR, bill import, report, export) works locally.

## Deployment (Cloudflare Pages)

1. Push this repository to GitHub;
2. In Cloudflare Pages, click **Create project → Connect to Git** and select the repo;
3. Leave the build command empty (pure static) and set the output directory to the root;
4. Add the `DEEPSEEK_API_KEY` environment variable;
5. Deploy — Functions take effect automatically.

## ⚠️ Disclaimer

This system generates AI-assisted content to support anti-fraud prevention. Since AI-generated content may contain inaccuracies or biases, please exercise critical thinking and independently verify any critical information before acting on it.

This project is intended solely for educational, research, and legitimate anti-fraud assistance purposes. Users are responsible for evaluating the accuracy and applicability of the generated content. The project team assumes no liability for any direct or indirect consequences arising from the use of this system.

## 📜 License

Released under the MIT License. You are free to use, modify, and distribute it, provided you retain the original copyright notice and attribution.

```text
Copyright (C) 2026 Xin Firefly-IV

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Acknowledgements

- Copyright Owner: **Xin Firefly-IV**
- Prompt Architect: **Wang A Black**
- UI Design Advisor: **Liu A Green**
- Inspiration: Automation Processing Pipeline
- Mission: Serving society through technology

---

© 2026 Xin Firefly-IV. All Rights Reserved. · Ver.3.8.1
