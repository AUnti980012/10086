/**
 * i18n 语言模块
 * 提供中英双语字典与切换逻辑（默认中文，用户选择持久化到 localStorage）
 * 本文件需在其余脚本之前加载。
 * 说明：字典中 zh 值即界面现有中文文案的逐字拷贝，切换英文不影响中文内容。
 */

(function () {
    'use strict';

    // ===== 中英对照表：['key', '中文', 'English'] =====
    const PAIRS = [
        // ---- 应用标题 / 署名 ----
        ['app.name', '反诈智能识别与报案辅助系统', 'Anti-Fraud Assistant'],
        ['app.title', '反诈智能识别与报案辅助系统 · 东北电力大学', 'Anti-Fraud Assistant · NEEPU'],
        ['app.subtitle', '创意来自东北电力大学易班工作站-Firefly TYPE IV', 'Concept by NEEPU YiBan Workstation - Firefly TYPE IV'],
        ['app.themeToggle', '切换明暗主题', 'Toggle light/dark theme'],
        ['app.univ', '东北电力大学', 'NEEPU'],
        ['app.footer', '© 2026 反诈智能识别与报案辅助系统 | 创意来自东北电力大学易班工作站 | AI引擎: DeepSeek + Tesseract OCR 作者Xin PR,Liu A Green,Wang A Black 根据 Apache-2.0 协议开源', '© 2026 Anti-Fraud Assistant | Concept by NEEPU YiBan Workstation | AI engine: DeepSeek + Tesseract OCR Authors: Xin PR, Liu A Green, Wang A Black Licensed under Apache-2.0'],
        ['app.license', '程序根据 Apache-2.0 协议开源', 'Open-sourced under the Apache-2.0 License'],
        ['app.licenseShort', 'Apache-2.0开源', 'Apache-2.0 Open Source'],

        // ---- 导航（桌面） ----
        ['nav.home', '首页', 'Home'],
        ['nav.identify', '诈骗识别', 'Fraud Detection'],
        ['nav.bill', '账单导入', 'Bill Import'],
        ['nav.report', '报案填报', 'Report Filing'],
        ['nav.history', '历史记录', 'History'],
        ['nav.setting', '系统设置', 'Settings'],

        // ---- 底部标签栏（移动端） ----
        ['tab.home', '首页', 'Home'],
        ['tab.identify', '识别', 'Detect'],
        ['tab.bill', '账单', 'Bills'],
        ['tab.report', '报案', 'Report'],
        ['tab.history', '历史', 'History'],
        ['tab.setting', '设置', 'Settings'],

        // ---- 首页 ----
        ['home.heroSub', '识别 · 判定 · 报案，一站式反诈辅助', 'Detect · Assess · Report — all-in-one anti-fraud assistance'],
        ['home.card1.title', '诈骗识别', 'Fraud Detection'],
        ['home.card1.desc', '关键词匹配 + OCR 提取 + DeepSeek 深度判定', 'Keyword matching + OCR extraction + DeepSeek deep analysis'],
        ['home.card2.title', '报案填报', 'Report Filing'],
        ['home.card2.desc', '三步表单向导，自动生成刑事控告书，支持 PDF 导出', 'Three-step form wizard that auto-generates a criminal complaint, with PDF export'],
        ['home.card3.title', '账单导入', 'Bill Import'],
        ['home.card3.desc', '微信/支付宝 CSV 账单自动解析，智能计算总支出', 'Auto-parses WeChat / Alipay CSV statements and computes total spending'],
        ['home.card4.title', 'AI 智能助手', 'AI Assistant'],
        ['home.card4.desc', 'DeepSeek 驱动的反诈科普与思政教育对话助手', 'A DeepSeek-powered anti-fraud education and civic-education chat assistant'],

        // ---- 聊天 ----
        ['chat.header', '反诈智能助手 · 思政融合版', 'Anti-Fraud Assistant · Civic-Education Edition'],
        ['chat.collapse', '收起', 'Collapse'],
        ['chat.clear', '清空对话', 'Clear chat'],
        ['chat.send', '发送', 'Send'],
        ['chat.placeholder', '输入你的问题，例如：遇到刷单诈骗怎么办？', 'Type your question, e.g. What should I do if I encounter an order-brushing scam?'],
        ['chat.inputAriaLabel', '输入你的问题', 'Enter your question'],
        ['chat.welcome', '你好！我是反诈科普与思政教育智能助手。我可以帮你识别诈骗套路、解析真实案例、提供防骗建议，并且融合法治诚信意识。请问有什么可以帮你？', "Hello! I'm your anti-fraud and civic-education assistant. I can help you identify scam tactics, analyze real cases, and offer anti-fraud advice, integrating legal awareness and integrity. How may I help you?"],
        ['chat.cleared', '对话已清空，请问有什么可以帮助你的？', 'Chat cleared. How may I help you?'],
        ['chat.noReply', '抱歉，未收到有效回复', 'Sorry, no valid response was received'],
        ['chat.requestFailed', '请求失败：', 'Request failed: '],
        ['chat.typing.think', '思考中', 'Thinking'],
        ['chat.typing.search', '寻找中', 'Searching'],
        ['chat.typing.compose', '组织语言中', 'Composing'],

        // ---- AI 提示词 ----
        ['ai.systemPrompt', '你是反诈科普与思政教育智能助手，专为大学生服务。结合法治意识、诚信责任，解析诈骗套路，给出预防建议，语气温和专业。', 'You are an anti-fraud and civic-education assistant serving university students. Integrating legal awareness and integrity, explain scam tactics and offer prevention advice in a warm, professional tone.'],
        ['ai.knowledgeHeader', '以下是你必须掌握的权威反诈关键词知识（含警方提示），回答相关问题时优先引用：', 'The following authoritative anti-fraud keyword knowledge (including police tips) is essential for you and should be cited first when answering relevant questions:'],
        ['ai.knowledgeItem', '【{keyword}】{desc} 警方提示：{tip}', '[{keyword}] {desc} Police tip: {tip}'],
        ['ai.expert', '反诈专家', 'Anti-fraud expert'],
        ['ai.analyzeFraud', '分析诈骗风险：', 'Analyze the fraud risk: '],
        ['ai.analysisDone', '分析完成', 'Analysis complete'],

        // ---- 诈骗识别页 ----
        ['identify.title', '诈骗识别', 'Fraud Detection'],
        ['identify.allTypes', '全类型诈骗', 'All Fraud Types'],
        ['identify.cat.police', '公安诈骗', 'Public-Security Fraud'],
        ['identify.cat.loan', '贷款诈骗', 'Loan Fraud'],
        ['identify.cat.service', '冒充客服', 'Fake Customer Service'],
        ['identify.cat.leader', '冒充领导熟人', 'Fake Boss / Acquaintance'],
        ['identify.textPlaceholder', '可直接粘贴短信、聊天记录等文本内容（也可只上传图片）', 'Paste SMS, chat records, or other text directly (or upload images only)'],
        ['identify.textAriaLabel', '输入或粘贴诈骗相关内容', 'Enter or paste fraud-related content'],
        ['identify.tip', '上传图片后点击"开始识别"使用 Tesseract OCR (本地引擎) 提取文字，支持中英文。', 'After uploading images, click "Start Detection" to extract text with Tesseract OCR (on-device engine), supporting Chinese and English.'],
        ['identify.upload', '点击或拖拽上传图片（JPG/PNG）', 'Click or drag to upload images (JPG/PNG)'],
        ['identify.desensitize', '自动脱敏（手机号/身份证/银行卡）', 'Auto-desensitize (phone number / ID card / bank card)'],
        ['identify.start', '开始识别', 'Start Detection'],
        ['identify.deep', 'DeepSeek深度判定', 'DeepSeek Deep Analysis'],
        ['identify.clear', '清空', 'Clear'],
        ['identify.fillToReport', '一键填到报案表', 'Fill into Report'],
        ['lightbox.alt', '预览大图', 'Preview image'],

        // ---- 账单导入页 ----
        ['bill.title', '账单导入', 'Bill Import'],
        ['bill.notice', '支持微信/支付宝官方导出的CSV/Excel格式账单，自动识别支出记录，计算总支出金额', 'Supports CSV/Excel statements exported from WeChat/Alipay; auto-identifies expense records and computes total spending'],
        ['bill.upload', '点击或拖拽上传账单文件', 'Click or drag to upload a statement file'],
        ['bill.parse', '解析账单', 'Parse Statement'],
        ['bill.importToReport', '导入报案表', 'Import into Report'],

        // ---- 报案填报页 ----
        ['report.title', '报案填报 · 刑事控告书', 'Report Filing · Criminal Complaint'],
        ['report.optional', '(选填)', '(Optional)'],
        ['report.step1', '控告人信息', 'Complainant Information'],
        ['report.step2', '被控告人信息', 'Accused Information'],
        ['report.step3', '事实与证据', 'Facts & Evidence'],
        ['report.section1', '一、控告人信息（您本人）', 'I. Complainant Information (You)'],
        ['report.section2', '二、被控告人信息（对方/骗子）', 'II. Accused Information (the other party / scammer)'],
        ['report.section2Notice1', '请尽量挖掘被控告人信息，越详细越有助于破案！仅', 'Please provide as much information about the accused as possible — the more detail, the better! Only '],
        ['report.section2Notice2', '为必填，其余选填。', ' is required; the rest is optional.'],
        ['report.section3', '三、被骗事实与经过', 'III. Facts and Circumstances of the Fraud'],
        ['report.section4', '四、证据材料', 'IV. Evidence'],
        ['report.name', '姓名', 'Name'],
        ['report.namePlaceholder', '请填写真实姓名', 'Enter your full legal name'],
        ['report.nameError', '请填写控告人姓名', "Please enter the complainant's name"],
        ['report.idNo', '身份证号', 'ID Number'],
        ['report.idNoPlaceholder', '18位，最后一位可为X', '18 digits; the last may be X'],
        ['report.idNoError', '请填写正确的身份证号码（18位数字或最后一位X）', 'Please enter a valid 18-digit ID number (last digit may be X)'],
        ['report.phone', '联系电话', 'Phone Number'],
        ['report.phonePlaceholder', '请填写11位手机号', 'Enter an 11-digit mobile number'],
        ['report.phoneError', '请填写正确的11位手机号码', 'Please enter a valid 11-digit mobile number'],
        ['report.address', '住址', 'Address'],
        ['report.addressPlaceholder', '请填写现住址，便于警方联系', 'Enter your current address so the police can reach you'],
        ['report.next', '下一步 →', 'Next →'],
        ['report.prev', '← 上一步', '← Previous'],
        ['report.accusedName', '网名/姓名', 'Screen Name / Name'],
        ['report.accusedNamePlaceholder', '已知的网名或真实姓名，不确定可填XXX', 'Known screen name or real name; enter XXX if unknown'],
        ['report.accusedNameError', '请填写被控告人网名或姓名（不确定填XXX）', "Please enter the accused's screen name or name (XXX if unknown)"],
        ['report.accusedPhone', '电话', 'Phone'],
        ['report.accusedPhonePlaceholder', '如已知对方手机号', "If the other party's mobile number is known"],
        ['report.accusedWechat', '微信号/QQ号', 'WeChat / QQ ID'],
        ['report.accusedWechatPlaceholder', '如已知对方微信ID或QQ号', "If the other party's WeChat ID or QQ number is known"],
        ['report.accusedAlipay', '支付宝账号', 'Alipay Account'],
        ['report.accusedAlipayPlaceholder', '如已知对方支付宝账号', "If the other party's Alipay account is known"],
        ['report.accusedBankCard', '银行卡号', 'Bank Card Number'],
        ['report.accusedBankCardPlaceholder', '如已知对方收款银行卡号', 'If the receiving bank card number is known'],
        ['report.accusedAddress', '大概住址或活动范围', 'Approximate Address / Area of Activity'],
        ['report.accusedAddressPlaceholder', '如已知对方所在城市或活动区域', "If the other party's city or area of activity is known"],
        ['report.fraudTime', '被骗时间', 'Time of Fraud'],
        ['report.fraudTimePlaceholder', '例：2026-03-14 15:30', 'e.g. 2026-03-14 15:30'],
        ['report.fraudTimeError', '请填写被骗时间', 'Please enter the time of the fraud'],
        ['report.fraudLocation', '被骗地点/操作地', 'Location of Fraud'],
        ['report.fraudLocationPlaceholder', '例：XX省XX市XX区（线上/线下具体地点）', 'e.g. XX Province, XX City, XX District (online/offline location)'],
        ['report.fraudLocationError', '请填写被骗地点', 'Please enter the location of the fraud'],
        ['report.contactMethod', '认识方式', 'How You Met'],
        ['report.contactMethodPlaceholder', '例：微信陌生好友添加、抖音私信等', 'e.g. added by a stranger on WeChat, Douyin private message, etc.'],
        ['report.fraudPlatform', '被骗平台/渠道', 'Platform / Channel'],
        ['report.fraudPlatformPlaceholder', '例：微信、抖音、陌生APP名称', 'e.g. WeChat, Douyin, name of an unknown app'],
        ['report.fraudPlatformError', '请填写被骗平台/渠道', 'Please enter the platform/channel'],
        ['report.fraudType', '诈骗类型', 'Type of Fraud'],
        ['report.fraudTypePlaceholder', '例：刷单返利、冒充客服、贷款诈骗等', 'e.g. order-brushing rebates, fake customer service, loan fraud, etc.'],
        ['report.fraudTypeError', '请填写诈骗类型', 'Please enter the type of fraud'],
        ['report.fraudMoney', '被骗总金额（元）', 'Total Amount Lost (CNY)'],
        ['report.fraudMoneyPlaceholder', '阿拉伯数字，如 3500', 'Arabic numerals, e.g. 3500'],
        ['report.fraudMoneyError', '请填写有效的金额数字', 'Please enter a valid amount'],
        ['report.fraudDetail', '被骗详细经过', 'Detailed Account'],
        ['report.fraudDetailPlaceholder', '请客观陈述：时间线、对方如何联系您、对方虚构/隐瞒了何种事实、您如何产生错误认识、如何处分财产、对方如何获利、何时发现被骗。全程用陈述句。', 'Please state objectively: the timeline, how the other party contacted you, what facts were fabricated or concealed, how you came to a mistaken belief, how you disposed of your property, how the other party profited, and when you discovered the fraud. Use declarative sentences throughout.'],
        ['report.fraudDetailError', '请填写被骗详细经过', 'Please enter the detailed account'],
        ['report.evidenceUpload', '证据图片上传', 'Upload Evidence Images'],
        ['report.evidenceUploadArea', '点击或拖拽上传证据图片（聊天截图、转账凭证等）', 'Click or drag to upload evidence images (chat screenshots, transfer receipts, etc.)'],
        ['report.evidenceText', '关联证据文本（OCR识别文本 + 用户原始输入）', 'Associated Evidence Text (OCR text + original user input)'],
        ['report.evidenceTip', '证据文本将随报案PDF一并导出。可在"诈骗识别"页面进行OCR识别后，点击下方按钮导入。', 'Evidence text will be exported with the report PDF. You can perform OCR on the "Fraud Detection" page, then click the button below to import.'],
        ['report.importEvidence', '从识别页导入证据文本', 'Import Evidence Text from Detection'],
        ['report.clearEvidence', '清空证据文本', 'Clear Evidence Text'],
        ['report.generate', '生成刑事控告书', 'Generate Criminal Complaint'],
        ['report.copy', '复制全文', 'Copy Full Text'],
        ['report.exportTxt', '导出TXT', 'Export TXT'],
        ['report.exportPdf', '生成PDF文件', 'Generate PDF'],

        // ---- 历史记录 ----
        ['history.title', '历史记录', 'History'],
        ['history.clearAll', '清空所有记录', 'Clear All Records'],
        ['history.empty', '暂无记录', 'No records yet'],
        ['history.itemTitle', '点击查看并恢复数据', 'Click to view and restore'],
        ['history.restore', '恢复', 'Restore'],
        ['history.detail', '详情', 'Detail'],
        ['history.delete', '删除', 'Delete'],
        ['history.notFound', '记录不存在', 'Record not found'],
        ['history.noResult', '无结果', 'No result'],
        ['history.reportRestored', '报案数据已恢复', 'Report data restored'],
        ['history.detectRestored', '识别结果已恢复', 'Detection result restored'],
        ['history.deepDetectRestored', 'AI判定结果已恢复', 'AI analysis result restored'],
        ['history.restoreUnsupported', '该记录类型暂不支持恢复', 'This record type does not support restoration'],
        ['history.detailTitle', '记录详情', 'Record Detail'],
        ['history.deleteConfirm', '确定删除这条记录？', 'Delete this record?'],
        ['history.deleted', '记录已删除', 'Record deleted'],
        ['history.clearConfirm', '清空所有历史记录？', 'Clear all history records?'],
        ['history.cleared', '所有记录已清空', 'All records cleared'],
        ['history.type.report', '报案', 'Report'],
        ['history.type.detect', '识别', 'Detection'],
        ['history.type.deepDetect', 'AI判定', 'AI Analysis'],
        ['history.reportPreview', '报案人: {name} | 金额: ¥{money} | {type}', 'Reporter: {name} | Amount: ¥{money} | {type}'],

        // ---- 系统设置 ----
        ['setting.title', '系统设置', 'Settings'],
        ['setting.autoSave', '自动保存历史记录', 'Auto-save history'],
        ['setting.defaultDesensitize', '默认开启自动脱敏', 'Enable desensitization by default'],
        ['setting.save', '保存设置', 'Save Settings'],
        ['setting.reset', '恢复默认', 'Reset to Default'],
        ['setting.saved', '设置已保存', 'Settings saved'],
        ['setting.resetDone', '已恢复默认设置', 'Default settings restored'],
        ['setting.theme', '主题', 'Theme'],
        ['setting.light', '浅色', 'Light'],
        ['setting.dark', '深色', 'Dark'],
        ['setting.language', '语言', 'Language'],
        ['setting.yiban', '易班网', 'Yiban'],

        // ---- 通用 ----
        ['common.close', '关闭', 'Close'],
        ['toast.storageFull', '存储空间已满，部分记录可能无法保存', 'Storage is full; some records may not be saved'],

        // ---- 证据文本 ----
        ['evidence.ocrLabel', '【OCR识别文本】', '[OCR Text]'],
        ['evidence.userLabel', '【用户原始输入文本】', '[Original User Input]'],
        ['evidence.imported', '证据文本已导入！可在报案材料生成时一并导出到PDF。', 'Evidence text imported! It will be exported with the report PDF.'],
        ['evidence.noneToImport', '暂无可导入的证据文本。请先在"诈骗识别"页面输入文本或上传图片进行OCR识别。', 'No evidence text to import yet. Please enter text or upload images for OCR on the "Fraud Detection" page first.'],
        ['evidence.clearConfirm', '确定清空所有关联证据文本？', 'Clear all associated evidence text?'],

        // ---- 诈骗识别检测结果 ----
        ['detect.keywordDictNotLoaded', '关键词字典尚未加载，请稍后再试', 'Keyword dictionary not loaded yet; please try again later'],
        ['detect.none', '未发现明显诈骗特征', 'No obvious fraud indicators detected'],
        ['detect.highlySuspicious', '高度疑似诈骗！（匹配关键词：{keywords}，共 {count} 个）', 'Highly suspected fraud! (Matched keywords: {keywords}, {count} in total)'],
        ['detect.suspected', '疑似{category}（匹配关键词：{keywords}）', 'Suspected {category} (matched keywords: {keywords})'],
        ['detect.suspectedFallback', '疑似诈骗', 'Suspected fraud'],
        ['detect.needTextOrImage', '请输入文本或上传图片', 'Please enter text or upload images'],
        ['detect.needInput', '请输入内容或上传图片', 'Please enter content or upload images'],
        ['detect.deepAnalyzing', 'DeepSeek分析中...', 'DeepSeek analyzing...'],
        ['detect.deepResult', '【DeepSeek深度判定】\n', '[DeepSeek Deep Analysis]\n'],
        ['detect.deepFailed', '判定失败', 'Judgment failed'],
        ['detect.deepFailedMsg', '判定失败：', 'Judgment failed: '],
        ['ocr.failed', 'OCR 识别失败：', 'OCR failed: '],

        // ---- OCR 进度 / 提示 ----
        ['ocr.preparing', '准备识别...', 'Preparing...'],
        ['ocr.preparingCount', '准备识别 0/{total}', 'Preparing 0/{total}'],
        ['ocr.recognizing', '识别中 {0}/{1}', 'Recognizing {0}/{1}'],
        ['ocr.recognizingImage', '识别图片 {0}/{1} ({2}%)', 'Recognizing image {0}/{1} ({2}%)'],
        ['ocr.recognizingImageSimple', '正在识别图片 {0}/{1}', 'Recognizing image {0}/{1}'],
        ['ocr.imageDone', '图片 {0}/{1} 完成', 'Image {0}/{1} complete'],
        ['ocr.imageLabel', '【图片{0}】', '[Image {0}]'],
        ['ocr.imageFailed', '【图片{0}】识别失败', '[Image {0}] recognition failed'],
        ['ocr.running', 'OCR 正在运行中，请勿重复点击', 'OCR is running; please do not click repeatedly'],
        ['ocr.notLoaded', 'Tesseract.js 尚未加载完成，请稍后再试。', 'Tesseract.js has not finished loading; please try again later.'],
        ['ocr.noText', '未识别到任何文字', 'No text recognized'],
        ['ocr.complete', 'Tesseract OCR 完成，已填入文本框。证据文本已暂存，可在报案填报中引用。', 'Tesseract OCR complete; the text has been filled into the text box. The evidence text is temporarily stored and can be referenced during report filing.'],
        ['ocr.downloadingModel', '正在下载 OCR 模型...', 'Downloading OCR model...'],
        ['ocr.downloadingLang', '正在下载 {0} 模型...', 'Downloading {0} model...'],
        ['ocr.downloadLangFailed', '{0} 下载失败（将使用在线加载）', '{0} download failed (will load online)'],
        ['ocr.downloadDone', '模型下载完成', 'Model download complete'],
        ['ocr.loadingModel', '正在加载 OCR 模型，请稍候...', 'Loading OCR model, please wait...'],
        ['ocr.loadFailed', 'Tesseract.js 加载失败，请检查网络连接后刷新页面。', 'Tesseract.js failed to load. Please check your network connection and refresh the page.'],

        // ---- 文件上传 ----
        ['upload.selectImage', '请选择图片文件（JPG/PNG）', 'Please select image files (JPG/PNG)'],
        ['upload.uploadedCount', '已上传 {0} 张图片', '{0} image(s) uploaded'],

        // ---- 账单解析 ----
        ['bill.xlsxNotLoaded', 'XLSX 库尚未加载，请检查网络后重试。', 'The XLSX library has not loaded; please check your network and retry.'],
        ['bill.uploadFirst', '请先上传账单文件', 'Please upload a statement file first'],
        ['bill.parsing', '解析中...', 'Parsing...'],
        ['bill.parseDone', '账单解析完成！\n总支出笔数：{count}笔\n总支出金额：¥{total}元', 'Statement parsed successfully!\nTotal expense entries: {count}\nTotal spending: ¥{total}'],
        ['bill.parseFailed', '解析失败', 'Parsing failed'],
        ['bill.parseFirst', '请先解析账单', 'Please parse the statement first'],
        ['bill.fileFormatError', '文件格式错误，无法解析Excel文件。', 'File format error: unable to parse the Excel file.'],
        ['bill.uploaded', '账单已上传', 'Statement uploaded'],
        ['bill.expenseCount', '总支出笔数', 'Total expense entries'],
        ['bill.expenseTotal', '总支出金额', 'Total spending'],
        ['bill.duplicate', '文件已存在，已跳过：', 'File already exists, skipped: '],
        ['bill.removeFile', '移除该账单文件', 'Remove this statement file'],
        ['bill.platform.wechat', '微信', 'WeChat'],
        ['bill.platform.alipay', '支付宝', 'Alipay'],
        ['bill.platform.bank', '银行', 'Bank'],
        ['bill.platform.other', '账单', 'Statement'],

        // ---- 报案报告操作 ----
        ['report.copied', '已复制到剪贴板', 'Copied to clipboard'],
        ['report.copyFailed', '复制失败，请手动复制', 'Copy failed; please copy manually'],
        ['report.generateFirst', '请先生成刑事控告书', 'Please generate the criminal complaint first'],
        ['report.txtDownloaded', 'TXT 文件已下载', 'TXT file downloaded'],
        ['report.jspdfNotLoaded', 'jsPDF 未加载，请检查网络后重试。', 'jsPDF not loaded; please check your network and retry.'],
        ['report.pdfGenerated', 'PDF 文件已生成', 'PDF generated'],
        ['report.pdfFailed', 'PDF 生成失败', 'PDF generation failed'],
        ['report.pdfMemoryError', 'PDF 生成失败：内存不足，请尝试使用导出 TXT 功能。', 'PDF generation failed: insufficient memory. Please try exporting as TXT.'],
        ['report.pdfNetworkError', 'PDF 生成失败：网络连接异常，请检查网络后重试。', 'PDF generation failed: network error. Please check your network and retry.'],
        ['report.completeRequired', '请完成当前步骤的必填项', 'Please complete the required fields in this step'],

        // ---- 《刑事控告书》文档模板 ----
        ['report.unfilled', '未填写', 'Not provided'],
        ['report.unknown', '未知', 'Unknown'],
        ['report.fileBase', '刑事控告书', 'Criminal_Complaint'],
        ['report.doc.title', '==================== 刑事控告书 ====================', '==================== CRIMINAL COMPLAINT ===================='],
        ['report.doc.about', '关于{name}涉嫌诈骗罪的刑事控告书', "Criminal complaint regarding {name}'s suspected crime of fraud"],
        ['report.doc.to', '致：有管辖权之公安机关', 'To: The competent public security organ'],
        ['report.doc.complainantInfo', '【控告人信息】', '[Complainant Information]'],
        ['report.doc.name', '姓名：', 'Name: '],
        ['report.doc.idNo', '身份证号：', 'ID Number: '],
        ['report.doc.phone', '联系电话：', 'Phone: '],
        ['report.doc.address', '住址：', 'Address: '],
        ['report.doc.accusedInfo', '【被控告人信息】', '[Accused Information]'],
        ['report.doc.accusedName', '网名/姓名：', 'Screen Name / Name: '],
        ['report.doc.accusedPhone', '电话：', 'Phone: '],
        ['report.doc.accusedWechat', '微信号/QQ号：', 'WeChat / QQ ID: '],
        ['report.doc.accusedAlipay', '支付宝账号：', 'Alipay Account: '],
        ['report.doc.accusedBankCard', '银行卡号：', 'Bank Card Number: '],
        ['report.doc.accusedAddress', '大概住址或活动范围：', 'Approximate Address / Area of Activity: '],
        ['report.doc.relief', '【请求事项】', '[Relief Sought]'],
        ['report.doc.reliefBody', '请求公安机关对被控告人{name}涉嫌诈骗罪一案立案侦查，依法追究其刑事责任。', 'We request that the public security organ file a case and investigate the accused {name} for the suspected crime of fraud, and pursue criminal liability in accordance with the law.'],
        ['report.doc.facts', '【事实与理由】', '[Facts and Grounds]'],
        ['report.doc.facts1', '一、被骗基本情况', 'I. Basic Facts of the Fraud'],
        ['report.doc.fraudTime', '被骗时间：', 'Time of Fraud: '],
        ['report.doc.fraudLocation', '被骗地点/操作地：', 'Location of Fraud: '],
        ['report.doc.contactMethod', '认识方式：', 'How You Met: '],
        ['report.doc.fraudPlatform', '被骗平台/渠道：', 'Platform / Channel: '],
        ['report.doc.fraudType', '诈骗类型：', 'Type of Fraud: '],
        ['report.doc.fraudMoney', '被骗总金额：人民币 ¥{money} 元', 'Total Amount Lost: CNY ¥{money}'],
        ['report.doc.facts2', '二、详细经过', 'II. Detailed Account'],
        ['report.doc.facts3', '三、法律分析', 'III. Legal Analysis'],
        ['report.doc.legalAnalysis', '被控告人虚构事实/隐瞒真相，致使控告人产生错误认识，控告人基于错误认识处分财产，被控告人获得财产，控告人遭受经济损失。被控告人的行为符合《中华人民共和国刑法》第二百六十六条诈骗罪的构成要件。', "The accused fabricated facts or concealed the truth, causing the complainant to form a mistaken belief, based on which the complainant disposed of property; the accused thereby obtained the property and the complainant suffered economic loss. The accused's conduct satisfies the elements of the crime of fraud under Article 266 of the Criminal Law of the People's Republic of China."],
        ['report.doc.evidenceList', '【证据清单】', '[List of Evidence]'],
        ['report.doc.evidence1', '证据1：控告人身份证复印件', "Evidence 1: A copy of the complainant's ID card"],
        ['report.doc.evidence2', '证据2：控告人与被控告人之间的聊天记录截图（{count}张图片）', 'Evidence 2: Screenshots of chat records between the complainant and the accused ({count} images)'],
        ['report.doc.evidence3', '证据3：转账记录/支付凭证', 'Evidence 3: Transfer records / payment receipts'],
        ['report.doc.evidence4', '证据4：OCR识别提取的文本内容（附后）', 'Evidence 4: Text content extracted by OCR (attached below)'],
        ['report.doc.evidence5', '证据5：控告人原始输入文本内容（附后）', "Evidence 5: The complainant's original input text (attached below)"],
        ['report.doc.evidenceAttachment', '【证据附件】', '[Evidence Attachments]'],
        ['report.doc.ocrText', '--- OCR识别文本 ---', '--- OCR Text ---'],
        ['report.doc.userText', '--- 用户原始输入文本 ---', '--- Original User Input ---'],
        ['report.doc.conclusion', '综上所述，被控告人{name}的行为已涉嫌构成诈骗罪，恳请贵局依法立案侦查，维护控告人的合法权益。', "In summary, the accused {name}'s conduct is suspected of constituting the crime of fraud. We respectfully request that your organ file a case and investigate in accordance with the law to protect the complainant's lawful rights."],
        ['report.doc.closing', '此致\n敬礼', 'Respectfully submitted,'],
        ['report.doc.complainant', '控告人：', 'Complainant: '],
        ['report.doc.date', '日期：', 'Date: '],
        ['report.doc.frame', '=====================================================', '====================================================='],

        // ---- 报案填报 notice（含必填标红星号，使用 innerHTML 注入） ----
        ['report.noticeHtml', '带 <span style="color:var(--danger);font-weight:bold;">*</span> 为必填项。请客观填写，配合警方初查，材料越齐全立案可能性越高。', 'Fields marked <span style="color:var(--danger);font-weight:bold;">*</span> are required. Please complete the form accurately to assist the police’s initial investigation; the more complete your materials, the higher the likelihood of case filing.'],
    ];

    // ===== 构建扁平字典 =====
    const zh = {};
    const en = {};
    PAIRS.forEach(([key, zhVal, enVal]) => {
        zh[key] = zhVal;
        en[key] = enVal;
    });

    // ===== 俄语字典（由上方中文逐条严谨直译，未改动任何 zh/en 原文） =====
    const ru = {
        // ---- 应用标题 / 署名 ----
        'app.name': 'Антимошенническая система',
        'app.title': 'Антимошенническая система · NEEPU',
        'app.subtitle': 'Идея: рабочая станция NEEPU «Ибань» — Firefly TYPE IV',
        'app.themeToggle': 'Переключить светлую/тёмную тему',
        'app.univ': 'NEEPU',
        'app.footer': '© 2026 Антимошенническая система | Идея: рабочая станция NEEPU «Ибань» | ИИ-движок: DeepSeek + Tesseract OCR. Авторы: Xin PR, Liu A Green, Wang A Black. Лицензировано по Apache-2.0',
        'app.license': 'Программа распространяется по лицензии Apache-2.0',
        'app.licenseShort': 'Apache-2.0',

        // ---- 导航（桌面） ----
        'nav.home': 'Главная',
        'nav.identify': 'Распознавание мошенничества',
        'nav.bill': 'Импорт выписки',
        'nav.report': 'Подача заявления',
        'nav.history': 'История',
        'nav.setting': 'Настройки',

        // ---- 底部标签栏（移动端） ----
        'tab.home': 'Главная',
        'tab.identify': 'Анализ',
        'tab.bill': 'Счёт',
        'tab.report': 'Заявка',
        'tab.history': 'История',
        'tab.setting': 'Опции',

        // ---- 首页 ----
        'home.heroSub': 'Распознавание · Оценка · Заявление — комплексная помощь в борьбе с мошенничеством',
        'home.card1.title': 'Распознавание мошенничества',
        'home.card1.desc': 'Поиск по ключевым словам + извлечение OCR + глубокая оценка DeepSeek',
        'home.card2.title': 'Подача заявления',
        'home.card2.desc': 'Трёхшаговый мастер форм с автоматическим составлением заявления о преступлении и экспортом в PDF',
        'home.card3.title': 'Импорт выписки',
        'home.card3.desc': 'Автоматический разбор выписок CSV WeChat/Alipay и расчёт общей суммы расходов',
        'home.card4.title': 'ИИ-ассистент',
        'home.card4.desc': 'Диалоговый ассистент по антимошенническому просвещению и гражданско-правовому воспитанию на базе DeepSeek',

        // ---- 聊天 ----
        'chat.header': 'Антимошеннический ассистент',
        'chat.collapse': 'Свернуть',
        'chat.clear': 'Очистить чат',
        'chat.send': 'Отправить',
        'chat.placeholder': 'Введите ваш вопрос…',
        'chat.inputAriaLabel': 'Введите ваш вопрос',
        'chat.welcome': 'Здравствуйте! Я — антимошеннический ассистент. Помогу распознать схемы мошенничества, разобрать случаи и дать советы по защите. Чем помочь?',
        'chat.cleared': 'Чат очищен. Чем я могу помочь?',
        'chat.noReply': 'К сожалению, действительный ответ не получен',
        'chat.requestFailed': 'Ошибка запроса: ',
        'chat.typing.think': 'Обдумываю',
        'chat.typing.search': 'Ищу',
        'chat.typing.compose': 'Формулирую ответ',

        // ---- AI 提示词 ----
        'ai.systemPrompt': 'Вы — интеллектуальный ассистент по антимошенническому просвещению и гражданско-правовому воспитанию, предназначенный для студентов вузов. Сочетая правовую грамотность и ответственность за добросовестность, разбирайте схемы мошенничества и давайте рекомендации по профилактике в мягком, профессиональном тоне.',
        'ai.knowledgeHeader': 'Ниже приведены авторитетные знания о ключевых словах мошенничества (включая советы полиции), которые вы обязаны знать и цитировать в первую очередь при ответах на соответствующие вопросы:',
        'ai.knowledgeItem': '【{keyword}】{desc} Совет полиции: {tip}',
        'ai.expert': 'Эксперт по борьбе с мошенничеством',
        'ai.analyzeFraud': 'Проанализируйте риск мошенничества: ',
        'ai.analysisDone': 'Анализ завершён',

        // ---- 诈骗识别页 ----
        'identify.title': 'Распознавание мошенничества',
        'identify.allTypes': 'Мошенничество всех видов',
        'identify.cat.police': 'Мошенничество от имени полиции',
        'identify.cat.loan': 'Кредитное мошенничество',
        'identify.cat.service': 'Поддельная служба поддержки',
        'identify.cat.leader': 'Выдача себя за руководителя/знакомого',
        'identify.textPlaceholder': 'Можно напрямую вставить текст SMS, переписки и т. д. (или только загрузить изображение)',
        'identify.textAriaLabel': 'Введите или вставьте содержимое, связанное с мошенничеством',
        'identify.tip': 'После загрузки изображения нажмите «Начать распознавание», чтобы извлечь текст с помощью Tesseract OCR (локальный движок), поддерживающего китайский и английский языки.',
        'identify.upload': 'Нажмите или перетащите изображение для загрузки (JPG/PNG)',
        'identify.desensitize': 'Автоматическое обезличивание (номер телефона / удостоверение личности / банковская карта)',
        'identify.start': 'Начать распознавание',
        'identify.deep': 'Глубокая оценка DeepSeek',
        'identify.clear': 'Очистить',
        'identify.fillToReport': 'Заполнить форму заявления одним кликом',
        'lightbox.alt': 'Предпросмотр изображения',

        // ---- 账单导入页 ----
        'bill.title': 'Импорт выписки',
        'bill.notice': 'Поддерживаются выписки в формате CSV/Excel, экспортированные из WeChat/Alipay; автоматическое распознавание расходных записей и расчёт общей суммы расходов',
        'bill.upload': 'Нажмите или перетащите файл выписки для загрузки',
        'bill.parse': 'Разобрать выписку',
        'bill.importToReport': 'Импортировать в форму заявления',

        // ---- 报案填报页 ----
        'report.title': 'Подача заявления · Заявление о преступлении',
        'report.optional': '(необязательно)',
        'report.step1': 'Сведения о заявителе',
        'report.step2': 'Сведения об обвиняемом',
        'report.step3': 'Факты и доказательства',
        'report.section1': 'I. Сведения о заявителе (о вас)',
        'report.section2': 'II. Сведения об обвиняемом (о второй стороне / мошеннике)',
        'report.section2Notice1': 'Постарайтесь как можно подробнее выяснить сведения об обвиняемом — чем подробнее, тем больше шансов на раскрытие дела! Только ',
        'report.section2Notice2': ' является обязательным, остальное — необязательно.',
        'report.section3': 'III. Факты и обстоятельства обмана',
        'report.section4': 'IV. Доказательства',
        'report.name': 'Фамилия и имя',
        'report.namePlaceholder': 'Введите ваши настоящие фамилию и имя',
        'report.nameError': 'Введите фамилию и имя заявителя',
        'report.idNo': 'Номер удостоверения личности',
        'report.idNoPlaceholder': '18 цифр, последняя может быть X',
        'report.idNoError': 'Введите корректный номер удостоверения личности (18 цифр, последняя может быть X)',
        'report.phone': 'Контактный телефон',
        'report.phonePlaceholder': 'Введите 11-значный номер мобильного телефона',
        'report.phoneError': 'Введите корректный 11-значный номер мобильного телефона',
        'report.address': 'Адрес',
        'report.addressPlaceholder': 'Введите текущий адрес, чтобы полиция могла с вами связаться',
        'report.next': 'Далее →',
        'report.prev': '← Назад',
        'report.accusedName': 'Ник / фамилия и имя',
        'report.accusedNamePlaceholder': 'Известный ник или настоящие фамилия и имя; при неуверенности укажите XXX',
        'report.accusedNameError': 'Введите ник или фамилию и имя обвиняемого (XXX, если неизвестно)',
        'report.accusedPhone': 'Телефон',
        'report.accusedPhonePlaceholder': 'Если номер мобильного телефона другой стороны известен',
        'report.accusedWechat': 'WeChat / QQ ID',
        'report.accusedWechatPlaceholder': 'Если известен WeChat ID или номер QQ другой стороны',
        'report.accusedAlipay': 'Аккаунт Alipay',
        'report.accusedAlipayPlaceholder': 'Если известен аккаунт Alipay другой стороны',
        'report.accusedBankCard': 'Номер банковской карты',
        'report.accusedBankCardPlaceholder': 'Если известен номер банковской карты для получения платежей',
        'report.accusedAddress': 'Примерный адрес или район деятельности',
        'report.accusedAddressPlaceholder': 'Если известен город или район деятельности другой стороны',
        'report.fraudTime': 'Время обмана',
        'report.fraudTimePlaceholder': 'Например: 2026-03-14 15:30',
        'report.fraudTimeError': 'Введите время обмана',
        'report.fraudLocation': 'Место обмана / место совершения операции',
        'report.fraudLocationPlaceholder': 'Например: провинция XX, город XX, район XX (конкретное место онлайн/офлайн)',
        'report.fraudLocationError': 'Введите место обмана',
        'report.contactMethod': 'Способ знакомства',
        'report.contactMethodPlaceholder': 'Например: добавление незнакомцем в WeChat, личное сообщение в Douyin и т. д.',
        'report.fraudPlatform': 'Платформа / канал обмана',
        'report.fraudPlatformPlaceholder': 'Например: WeChat, Douyin, название неизвестного приложения',
        'report.fraudPlatformError': 'Введите платформу/канал обмана',
        'report.fraudType': 'Тип мошенничества',
        'report.fraudTypePlaceholder': 'Например: возврат за накрутку заказов, поддельная служба поддержки, кредитное мошенничество и т. д.',
        'report.fraudTypeError': 'Введите тип мошенничества',
        'report.fraudMoney': 'Общая сумма ущерба (юань)',
        'report.fraudMoneyPlaceholder': 'Арабские цифры, например 3500',
        'report.fraudMoneyError': 'Введите корректную сумму',
        'report.fraudDetail': 'Подробное описание обмана',
        'report.fraudDetailPlaceholder': 'Изложите объективно: хронологию, как другая сторона связалась с вами, какие факты были выдуманы или скрыты, как у вас возникло ошибочное представление, как вы распорядились имуществом, как другая сторона получила выгоду и когда вы обнаружили обман. На протяжении всего текста используйте повествовательные предложения.',
        'report.fraudDetailError': 'Введите подробное описание обмана',
        'report.evidenceUpload': 'Загрузка изображений-доказательств',
        'report.evidenceUploadArea': 'Нажмите или перетащите изображения-доказательства (скриншоты переписки, квитанции о переводе и т. д.)',
        'report.evidenceText': 'Связанный текст доказательств (текст OCR + исходный ввод пользователя)',
        'report.evidenceTip': 'Текст доказательств будет экспортирован вместе с PDF заявления. Вы можете выполнить OCR на странице «Распознавание мошенничества», затем нажать кнопку ниже для импорта.',
        'report.importEvidence': 'Импортировать текст доказательств со страницы распознавания',
        'report.clearEvidence': 'Очистить текст доказательств',
        'report.generate': 'Составить заявление о преступлении',
        'report.copy': 'Копировать весь текст',
        'report.exportTxt': 'Экспорт TXT',
        'report.exportPdf': 'Создать PDF-файл',

        // ---- 历史记录 ----
        'history.title': 'История',
        'history.clearAll': 'Очистить все записи',
        'history.empty': 'Записей пока нет',
        'history.itemTitle': 'Нажмите, чтобы просмотреть и восстановить',
        'history.restore': 'Восстановить',
        'history.detail': 'Подробнее',
        'history.delete': 'Удалить',
        'history.notFound': 'Запись не найдена',
        'history.noResult': 'Нет результата',
        'history.reportRestored': 'Данные заявления восстановлены',
        'history.detectRestored': 'Результат распознавания восстановлен',
        'history.deepDetectRestored': 'Результат ИИ-оценки восстановлен',
        'history.restoreUnsupported': 'Восстановление данного типа записи не поддерживается',
        'history.detailTitle': 'Подробности записи',
        'history.deleteConfirm': 'Удалить эту запись?',
        'history.deleted': 'Запись удалена',
        'history.clearConfirm': 'Очистить все записи истории?',
        'history.cleared': 'Все записи очищены',
        'history.type.report': 'Заявление',
        'history.type.detect': 'Распознавание',
        'history.type.deepDetect': 'ИИ-оценка',
        'history.reportPreview': 'Заявитель: {name} | Сумма: ¥{money} | {type}',

        // ---- 系统设置 ----
        'setting.title': 'Настройки',
        'setting.autoSave': 'Автосохранение истории',
        'setting.defaultDesensitize': 'Включить обезличивание по умолчанию',
        'setting.save': 'Сохранить настройки',
        'setting.reset': 'Сбросить по умолчанию',
        'setting.saved': 'Настройки сохранены',
        'setting.resetDone': 'Настройки по умолчанию восстановлены',
        'setting.theme': 'Тема',
        'setting.light': 'Светлая',
        'setting.dark': 'Тёмная',
        'setting.language': 'Язык',
        'setting.yiban': 'Ибань',

        // ---- 通用 ----
        'common.close': 'Закрыть',
        'toast.storageFull': 'Хранилище заполнено, часть записей может не сохраниться',

        // ---- 证据文本 ----
        'evidence.ocrLabel': '【Текст OCR】',
        'evidence.userLabel': '【Исходный ввод пользователя】',
        'evidence.imported': 'Текст доказательств импортирован! Он будет экспортирован в PDF при составлении материалов заявления.',
        'evidence.noneToImport': 'Пока нет текста доказательств для импорта. Сначала введите текст или загрузите изображения для OCR на странице «Распознавание мошенничества».',
        'evidence.clearConfirm': 'Очистить весь связанный текст доказательств?',

        // ---- 诈骗识别检测结果 ----
        'detect.keywordDictNotLoaded': 'Словарь ключевых слов ещё не загружен, повторите попытку позже',
        'detect.none': 'Явных признаков мошенничества не обнаружено',
        'detect.highlySuspicious': 'Высокая вероятность мошенничества! (Найденные ключевые слова: {keywords}, всего {count})',
        'detect.suspected': 'Подозрение на {category} (найденные ключевые слова: {keywords})',
        'detect.suspectedFallback': 'Подозрение на мошенничество',
        'detect.needTextOrImage': 'Введите текст или загрузите изображение',
        'detect.needInput': 'Введите содержимое или загрузите изображение',
        'detect.deepAnalyzing': 'DeepSeek анализирует...',
        'detect.deepResult': '【Глубокая оценка DeepSeek】\n',
        'detect.deepFailed': 'Оценка не удалась',
        'detect.deepFailedMsg': 'Оценка не удалась: ',
        'ocr.failed': 'Ошибка распознавания OCR: ',

        // ---- OCR 进度 / 提示 ----
        'ocr.preparing': 'Подготовка распознавания...',
        'ocr.preparingCount': 'Подготовка распознавания 0/{total}',
        'ocr.recognizing': 'Распознавание {0}/{1}',
        'ocr.recognizingImage': 'Распознавание изображения {0}/{1} ({2}%)',
        'ocr.recognizingImageSimple': 'Распознавание изображения {0}/{1}',
        'ocr.imageDone': 'Изображение {0}/{1} завершено',
        'ocr.imageLabel': '【Изображение {0}】',
        'ocr.imageFailed': '【Изображение {0}】распознать не удалось',
        'ocr.running': 'OCR уже выполняется, не нажимайте повторно',
        'ocr.notLoaded': 'Tesseract.js ещё не загружен, повторите попытку позже.',
        'ocr.noText': 'Текст не распознан',
        'ocr.complete': 'Tesseract OCR завершён, текст вставлен в текстовое поле. Текст доказательств временно сохранён, его можно использовать при подаче заявления.',
        'ocr.downloadingModel': 'Загрузка модели OCR...',
        'ocr.downloadingLang': 'Загрузка модели {0}...',
        'ocr.downloadLangFailed': 'Загрузка {0} не удалась (будет использована онлайн-загрузка)',
        'ocr.downloadDone': 'Загрузка модели завершена',
        'ocr.loadingModel': 'Загрузка модели OCR, подождите...',
        'ocr.loadFailed': 'Не удалось загрузить Tesseract.js. Проверьте сетевое подключение и обновите страницу.',

        // ---- 文件上传 ----
        'upload.selectImage': 'Выберите файлы изображений (JPG/PNG)',
        'upload.uploadedCount': 'Загружено изображений: {0}',

        // ---- 账单解析 ----
        'bill.xlsxNotLoaded': 'Библиотека XLSX ещё не загружена, проверьте сеть и повторите попытку.',
        'bill.uploadFirst': 'Сначала загрузите файл выписки',
        'bill.parsing': 'Разбор...',
        'bill.parseDone': 'Разбор выписки завершён!\nВсего расходных записей: {count}\nОбщая сумма расходов: ¥{total}',
        'bill.parseFailed': 'Разбор не удался',
        'bill.parseFirst': 'Сначала разберите выписку',
        'bill.fileFormatError': 'Ошибка формата файла: невозможно разобрать файл Excel.',
        'bill.uploaded': 'Выписка загружена',
        'bill.expenseCount': 'Всего расходных записей',
        'bill.expenseTotal': 'Общая сумма расходов',
        'bill.duplicate': 'Файл уже существует, пропущен: ',
        'bill.removeFile': 'Удалить этот файл выписки',
        'bill.platform.wechat': 'WeChat',
        'bill.platform.alipay': 'Alipay',
        'bill.platform.bank': 'Банк',
        'bill.platform.other': 'Выписка',

        // ---- 报案报告操作 ----
        'report.copied': 'Скопировано в буфер обмена',
        'report.copyFailed': 'Не удалось скопировать, скопируйте вручную',
        'report.generateFirst': 'Сначала составьте заявление о преступлении',
        'report.txtDownloaded': 'Файл TXT загружен',
        'report.jspdfNotLoaded': 'jsPDF не загружен, проверьте сеть и повторите попытку.',
        'report.pdfGenerated': 'PDF-файл создан',
        'report.pdfFailed': 'Не удалось создать PDF',
        'report.pdfMemoryError': 'Не удалось создать PDF: недостаточно памяти. Попробуйте экспорт в TXT.',
        'report.pdfNetworkError': 'Не удалось создать PDF: ошибка сети. Проверьте сеть и повторите попытку.',
        'report.completeRequired': 'Заполните обязательные поля текущего шага',

        // ---- 《刑事控告书》文档模板 ----
        'report.unfilled': 'Не указано',
        'report.unknown': 'Неизвестно',
        'report.fileBase': 'Zayavlenie_o_prestuplenii',
        'report.doc.title': '==================== ЗАЯВЛЕНИЕ О ПРЕСТУПЛЕНИИ ====================',
        'report.doc.about': 'Заявление о преступлении по подозрению {name} в мошенничестве',
        'report.doc.to': 'Кому: компетентному органу общественной безопасности',
        'report.doc.complainantInfo': '【Сведения о заявителе】',
        'report.doc.name': 'Фамилия и имя: ',
        'report.doc.idNo': 'Номер удостоверения личности: ',
        'report.doc.phone': 'Контактный телефон: ',
        'report.doc.address': 'Адрес: ',
        'report.doc.accusedInfo': '【Сведения об обвиняемом】',
        'report.doc.accusedName': 'Ник / фамилия и имя: ',
        'report.doc.accusedPhone': 'Телефон: ',
        'report.doc.accusedWechat': 'WeChat / QQ ID: ',
        'report.doc.accusedAlipay': 'Аккаунт Alipay: ',
        'report.doc.accusedBankCard': 'Номер банковской карты: ',
        'report.doc.accusedAddress': 'Примерный адрес или район деятельности: ',
        'report.doc.relief': '【Требования】',
        'report.doc.reliefBody': 'Просим орган общественной безопасности возбудить уголовное дело и провести расследование по делу о подозрении {name} в совершении преступления мошенничества и привлечь его к уголовной ответственности в установленном законом порядке.',
        'report.doc.facts': '【Факты и обоснование】',
        'report.doc.facts1': 'I. Основные обстоятельства обмана',
        'report.doc.fraudTime': 'Время обмана: ',
        'report.doc.fraudLocation': 'Место обмана / место операции: ',
        'report.doc.contactMethod': 'Способ знакомства: ',
        'report.doc.fraudPlatform': 'Платформа / канал обмана: ',
        'report.doc.fraudType': 'Тип мошенничества: ',
        'report.doc.fraudMoney': 'Общая сумма ущерба: ¥{money} юаней',
        'report.doc.facts2': 'II. Подробные обстоятельства',
        'report.doc.facts3': 'III. Правовой анализ',
        'report.doc.legalAnalysis': 'Обвиняемый выдумал факты / скрыл истину, что привело к возникновению у заявителя ошибочного представления; на основании этого ошибочного представления заявитель распорядился имуществом; обвиняемый получил имущество, а заявитель понёс экономический ущерб. Действия обвиняемого соответствуют составу преступления мошенничества, предусмотренного статьёй 266 Уголовного кодекса Китайской Народной Республики.',
        'report.doc.evidenceList': '【Перечень доказательств】',
        'report.doc.evidence1': 'Доказательство 1: копия удостоверения личности заявителя',
        'report.doc.evidence2': 'Доказательство 2: скриншоты переписки между заявителем и обвиняемым ({count} изображений)',
        'report.doc.evidence3': 'Доказательство 3: записи о переводах / платёжные квитанции',
        'report.doc.evidence4': 'Доказательство 4: текст, извлечённый посредством OCR (прилагается ниже)',
        'report.doc.evidence5': 'Доказательство 5: исходный текст заявителя (прилагается ниже)',
        'report.doc.evidenceAttachment': '【Приложение с доказательствами】',
        'report.doc.ocrText': '--- Текст OCR ---',
        'report.doc.userText': '--- Исходный текст пользователя ---',
        'report.doc.conclusion': 'Таким образом, действия обвиняемого {name} подозреваются в совершении преступления мошенничества. Просим ваше ведомство возбудить уголовное дело и провести расследование в соответствии с законом для защиты законных прав заявителя.',
        'report.doc.closing': 'С уважением,',
        'report.doc.complainant': 'Заявитель: ',
        'report.doc.date': 'Дата: ',
        'report.doc.frame': '=====================================================',

        // ---- 报案填报 notice（含必填标红星号，使用 innerHTML 注入） ----
        'report.noticeHtml': 'Поля, отмеченные <span style="color:var(--danger);font-weight:bold;">*</span>, являются обязательными. Заполняйте форму точно, чтобы содействовать первичному расследованию полиции; чем полнее ваши материалы, тем выше вероятность возбуждения дела.',
    };

    window.I18N = {
        current: 'zh',
        dict: { zh, en, ru },
    };

    // ===== 取词函数（支持 {name}/{0} 占位符插值） =====
    window.t = function (key, vars) {
        const dict = window.I18N.dict[window.I18N.current];
        let s = (dict && dict[key] !== undefined) ? dict[key]
            : (window.I18N.dict.zh[key] !== undefined) ? window.I18N.dict.zh[key]
            : key;
        if (vars && typeof vars === 'object') {
            for (const k in vars) {
                s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
            }
        }
        return s;
    };

    // ===== 应用语言到 DOM =====
    function applyLanguage(lang) {
        window.I18N.current = lang;
        const dict = window.I18N.dict[lang] || window.I18N.dict.zh;

        // 纯文本节点
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const k = el.getAttribute('data-i18n');
            if (dict[k] !== undefined) el.textContent = dict[k];
        });
        // innerHTML 节点（含必填星号等内联结构）
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            const k = el.getAttribute('data-i18n-html');
            if (dict[k] !== undefined) el.innerHTML = dict[k];
        });
        // placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            const k = el.getAttribute('data-i18n-placeholder');
            if (dict[k] !== undefined) el.setAttribute('placeholder', dict[k]);
        });
        // title
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            const k = el.getAttribute('data-i18n-title');
            if (dict[k] !== undefined) el.setAttribute('title', dict[k]);
        });
        // alt
        document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
            const k = el.getAttribute('data-i18n-alt');
            if (dict[k] !== undefined) el.setAttribute('alt', dict[k]);
        });
        // aria-label
        document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
            const k = el.getAttribute('data-i18n-aria-label');
            if (dict[k] !== undefined) el.setAttribute('aria-label', dict[k]);
        });

        // 语言属性与标题
        document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : (lang === 'ru' ? 'ru' : 'zh-CN'));
        document.title = window.t('app.title');

        // 切换按钮文案（显示下一个语言代码，循环 zh → en → ru → zh）
        const btn = document.getElementById('langToggleBtn');
        if (btn) {
            const order = ['zh', 'en', 'ru'];
            const next = order[(order.indexOf(lang) + 1) % order.length];
            btn.textContent = next === 'zh' ? '中' : next.toUpperCase();
        }

        // 同步移动端设置页「语言」分段控件激活态
        document.querySelectorAll('#langSegmented .seg-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.value === lang); });

        // 通知各模块重渲染动态内容
        document.dispatchEvent(new CustomEvent('languagechange'));
    }

    // ===== 设置并持久化语言 =====
    window.setLanguage = function (lang) {
        applyLanguage(lang);
        try { localStorage.setItem('langPref', lang); } catch (e) { /* 忽略 */ }
    };

    // ===== 初始化：读取偏好（默认中文）并绑定切换按钮 =====
    function initLanguage() {
        let lang = 'zh';
        try { lang = localStorage.getItem('langPref') || 'zh'; } catch (e) { lang = 'zh'; }
        if (lang !== 'zh' && lang !== 'en' && lang !== 'ru') lang = 'zh';
        applyLanguage(lang);

        const btn = document.getElementById('langToggleBtn');
        if (btn) {
            btn.addEventListener('click', function () {
                const order = ['zh', 'en', 'ru'];
                const next = order[(order.indexOf(window.I18N.current) + 1) % order.length];
                window.setLanguage(next);
            });
        }

        // 移动端设置页「语言」分段控件点击
        document.querySelectorAll('#langSegmented .seg-btn').forEach(function (b) {
            b.addEventListener('click', function () { window.setLanguage(b.dataset.value); });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguage);
    } else {
        initLanguage();
    }
})();
