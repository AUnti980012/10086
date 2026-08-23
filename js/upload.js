/**
 * 文件上传处理模块
 * 包含：handleFiles（Promise.all等待FileReader）、initUpload、OCR相关
 */

let identifyImages = [];
let reportImages = [];
let billFiles = [];
let billFileSeq = 0;
let isOcrRunning = false; // 防止并发OCR

// ===== 文件处理（Promise.all等待所有FileReader完成） =====
function handleFiles(files, container, cb) {
    let valid = Array.from(files).filter(f => f.type.includes('image/'));
    if (!valid.length) {
        if (files.length > 0) showToast(t('upload.selectImage'), 'warning');
        return;
    }
    let imageFiles = [];
    container.innerHTML = '';

    // 用Promise.all等待所有FileReader完成
    Promise.all(valid.map((file, idx) => {
        return new Promise((resolve) => {
            let reader = new FileReader();
            reader.onload = e => resolve({ id: Date.now() + idx, file, url: e.target.result });
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    })).then(results => {
        results.filter(Boolean).forEach(r => {
            imageFiles.push(r);
            let div = document.createElement('div');
            div.className = 'preview-item';
            let img = document.createElement('img');
            img.src = r.url;
            let del = document.createElement('div');
            del.className = 'preview-del';
            del.textContent = '×';
            let rid = r.id;
            del.onclick = (e) => {
                e.stopPropagation();
                const idx = imageFiles.findIndex(i => i.id === rid);
                if (idx > -1) imageFiles.splice(idx, 1); // 原地删除，模块级数组（reportImages/identifyImages）同步
                div.remove();
                // 更新计数文字
                let countEl = container.parentElement.querySelector('.upload-count');
                if (countEl) {
                    if (imageFiles.length === 0) {
                        countEl.remove();
                    } else {
                        countEl.textContent = t('upload.uploadedCount', { 0: imageFiles.length });
                    }
                }
            };
            div.appendChild(img);
            div.appendChild(del);
            container.appendChild(div);
        });
        // 显示上传数量提示
        let countEl = container.parentElement.querySelector('.upload-count');
        if (!countEl) {
            countEl = document.createElement('div');
            countEl.className = 'upload-count';
            countEl.style.cssText = 'font-size:12px;color:var(--text-tertiary);margin:4px 0;';
            container.parentElement.insertBefore(countEl, container.nextSibling);
        }
        countEl.textContent = t('upload.uploadedCount', { 0: results.filter(Boolean).length });
        cb(imageFiles);
    });
}

// ===== 通用上传初始化 =====
function initUpload(areaId, fileId, previewId, cb) {
    const area = document.getElementById(areaId),
        input = document.getElementById(fileId),
        container = document.getElementById(previewId);
    if (!area || !input) return;
    // 键盘可达：设为可聚焦按钮，Enter/Space 触发文件选择
    area.tabIndex = 0;
    area.setAttribute('role', 'button');
    area.addEventListener('click', () => input.click());
    area.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', e => handleFiles(e.target.files, container, cb));
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', e => {
        e.preventDefault();
        area.classList.remove('dragover');
        handleFiles(e.dataTransfer.files, container, cb);
    });
}

// ===== OCR进度显示 =====
function showOcrProgress(totalImages) {
    const container = document.getElementById('ocrProgressContainer');
    const fill = document.getElementById('ocrProgressFill');
    const status = document.getElementById('ocrProgressStatus');
    const percent = document.getElementById('ocrProgressPercent');
    if (!container) return;
    container.classList.add('active');
    fill.style.width = '0%';
    percent.textContent = '0%';
    status.textContent = t('ocr.preparingCount', { total: totalImages });
}

function updateOcrProgress(currentIndex, total, progressFraction, statusText) {
    const fill = document.getElementById('ocrProgressFill');
    const status = document.getElementById('ocrProgressStatus');
    const percent = document.getElementById('ocrProgressPercent');
    if (!fill || !status) return;
    const perImageWeight = 1 / total;
    const done = currentIndex * perImageWeight;
    const currentPart = progressFraction * perImageWeight;
    const overall = Math.min(Math.round((done + currentPart) * 100), 100);
    fill.style.width = overall + '%';
    percent.textContent = overall + '%';
    status.textContent = statusText || t('ocr.recognizing', { 0: currentIndex + 1, 1: total });
}

function hideOcrProgress() {
    const container = document.getElementById('ocrProgressContainer');
    if (container) container.classList.remove('active');
}

// ===== OCR 模型下载进度（页面内显示） =====
function showModelDownloadProgress(downloaded, total, message) {
    const container = document.getElementById('ocrProgressContainer');
    const fill = document.getElementById('ocrProgressFill');
    const status = document.getElementById('ocrProgressStatus');
    const percent = document.getElementById('ocrProgressPercent');
    if (!container || !fill || !status) return;
    container.classList.add('active');
    const pct = Math.round((downloaded / total) * 100);
    fill.style.width = pct + '%';
    percent.textContent = pct + '%';
    status.textContent = message || t('ocr.downloadingModel');
}

// ===== OCR识别 =====
async function ocrWithTesseract(file, index, total) {
    return new Promise((resolve, reject) => {
        const lang = (window.I18N && window.I18N.current === 'ru') ? 'rus+eng' : 'chi_sim+eng';
        Tesseract.recognize(file, lang, {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    updateOcrProgress(index, total, m.progress || 0,
                        t('ocr.recognizingImage', { 0: index + 1, 1: total, 2: Math.round((m.progress || 0) * 100) }));
                }
            }
        }).then(result => {
            resolve(result.data.text.trim());
        }).catch(reject);
    });
}

async function ocrImagesWithTesseract(images) {
    if (!images.length) return;
    if (isOcrRunning) {
        showToast(t('ocr.running'), 'warning');
        return;
    }
    isOcrRunning = true;
    try {
    // 先显示进度条容器
    let ocrDiv = document.getElementById('ocrResult');
    let fraudTextarea = document.getElementById('fraudText');
    let allText = [];
    showOcrProgress(images.length);

    // 确保Tesseract已加载（含模型下载进度，显示在页面进度条上）
    await loadTesseract((downloaded, total, message) => {
        showModelDownloadProgress(downloaded, total, message);
    });
    if (typeof Tesseract === 'undefined') {
        showToast(t('ocr.notLoaded'), 'error');
        isOcrRunning = false;
        return;
    }

    // 模型已就绪，开始逐图识别（剩余 90% 进度）
    for (let i = 0; i < images.length; i++) {
        updateOcrProgress(i, images.length, 0, t('ocr.recognizingImageSimple', { 0: i + 1, 1: images.length }));
        try {
            const recognized = await ocrWithTesseract(images[i].file, i, images.length);
            if (recognized) allText.push(t('ocr.imageLabel', { 0: i + 1 }) + '\n' + recognized);
        } catch (err) {
            allText.push(t('ocr.imageFailed', { 0: i + 1 }));
        }
        updateOcrProgress(i, images.length, 1, t('ocr.imageDone', { 0: i + 1, 1: images.length }));
    }
    hideOcrProgress();
    let combined = allText.join('\n\n');
    if (!combined.trim()) {
        isOcrRunning = false;
        ocrDiv.innerHTML = t('ocr.noText');
        return;
    }
    if (document.getElementById('desensitizeSwitch').checked) combined = desensitizeText(combined);
    fraudTextarea.value = fraudTextarea.value ? fraudTextarea.value + "\n\n" + combined : combined;
    globalOcrText = combined;
    ocrDiv.innerHTML = t('ocr.complete');
    } finally {
        isOcrRunning = false;
    }
}

// ===== 初始化上传组件 =====
function initImageUpload() {
    initUpload('identifyUpload', 'identifyFile', 'identifyPreview', (files) => {
        identifyImages = files;
        // 不再自动触发OCR，改为手动点击"开始识别"
    });
    initUpload('reportUpload', 'reportFile', 'reportPreview', (files) => {
        reportImages = files;
    });
}

// ===== 账单上传 =====
function initBillUpload() {
    let area = document.getElementById('billUpload'),
        input = document.getElementById('billFile');
    if (!area || !input) return;

    // 渲染已上传文件列表（图标 + 文件名 + 删除按钮）
    function renderBillFileList() {
        let list = document.getElementById('billFileList');
        let hint = area.querySelector('span[data-i18n="bill.upload"]');
        if (!list) return;
        if (billFiles.length === 0) {
            list.hidden = true;
            list.innerHTML = '';
            if (hint) hint.style.display = '';
            return;
        }
        list.hidden = false;
        if (hint) hint.style.display = 'none';
        list.innerHTML = billFiles.map(f =>
            '<div class="bill-file-chip">' +
                ICONS.doc +
                '<span class="bill-file-chip-name">' + escapeHtml(f.fileName) + '</span>' +
                '<button type="button" class="bill-file-chip-del" title="' + escapeHtml(t('bill.removeFile')) + '" aria-label="' + escapeHtml(t('bill.removeFile')) + '" data-id="' + f.id + '">×</button>' +
            '</div>'
        ).join('');
        list.querySelectorAll('.bill-file-chip-del').forEach(btn => {
            btn.addEventListener('click', () => {
                billFiles = billFiles.filter(f => f.id !== btn.getAttribute('data-id'));
                renderBillFileList();
            });
        });
    }

    // 处理一批账单文件（点击选择与拖拽共用，支持多文件）
    function handleBillFiles(files) {
        let valid = Array.from(files || []).filter(f => {
            let ext = f.name.split('.').pop().toLowerCase();
            return ['csv', 'xlsx', 'xls'].includes(ext);
        });
        if (files && files.length && !valid.length) {
            showToast(t('bill.fileFormatError'), 'error');
            return;
        }
        valid.forEach(file => {
            // 按文件名去重
            if (billFiles.some(b => b.fileName === file.name)) {
                showToast(t('bill.duplicate') + ' ' + file.name, 'warning');
                return;
            }
            let ext = file.name.split('.').pop().toLowerCase();
            let reader = new FileReader();
            reader.onload = ev => {
                let id = 'bill_' + (++billFileSeq);
                if (ext === 'csv') {
                    let buf = ev.target.result; // ArrayBuffer
                    let raw;
                    // 编码探测：优先严格 UTF-8，非法则回退 GBK（兼容老版本微信/支付宝导出）
                    try {
                        raw = new TextDecoder('utf-8', { fatal: true }).decode(buf);
                    } catch (e) {
                        raw = new TextDecoder('gbk').decode(buf);
                    }
                    // 去除 UTF-8 BOM（Windows 导出的 CSV 常带有 BOM）
                    raw = raw.replace(/^﻿/, '');
                    // 自动检测分隔符：微信/支付宝 CSV 常用分号，标准 CSV 用逗号
                    let semiColonCount = (raw.match(/;/g) || []).length;
                    let commaCount = (raw.match(/,/g) || []).length;
                    let delimiter = semiColonCount > commaCount ? ';' : ',';
                    billFiles.push({ id, raw, type: 'csv', delimiter, fileName: file.name });
                } else {
                    try {
                        let wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
                        billFiles.push({ id, raw: wb, type: 'xlsx', fileName: file.name });
                    } catch (e) {
                        showToast(t('bill.fileFormatError'), 'error');
                        return;
                    }
                }
                renderBillFileList();
                showToast(t('bill.uploaded'), 'success');
            };
            reader.onerror = () => showToast(t('bill.fileFormatError'), 'error');
            reader.readAsArrayBuffer(file);
        });
    }

    area.addEventListener('click', () => input.click());
    input.addEventListener('change', e => handleBillFiles(e.target.files));
    // 拖拽上传（与 initUpload 保持一致的 dragover/dragleave/drop）
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', e => {
        e.preventDefault();
        area.classList.remove('dragover');
        handleBillFiles(e.dataTransfer.files);
    });
}

// 暴露给全局
window.identifyImages = identifyImages;
window.reportImages = reportImages;
window.billFiles = billFiles;
window.handleFiles = handleFiles;
window.initUpload = initUpload;
window.ocrImagesWithTesseract = ocrImagesWithTesseract;
window.initImageUpload = initImageUpload;
window.initBillUpload = initBillUpload;
window.showOcrProgress = showOcrProgress;
window.updateOcrProgress = updateOcrProgress;
window.hideOcrProgress = hideOcrProgress;
