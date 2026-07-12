/**
 * 文件上传处理模块
 * 包含：handleFiles（Promise.all等待FileReader）、initUpload、OCR相关
 */

let identifyImages = [];
let reportImages = [];
let billData = null;
let isOcrRunning = false; // 防止并发OCR

// ===== 文件处理（Promise.all等待所有FileReader完成） =====
function handleFiles(files, container, cb) {
    let valid = Array.from(files).filter(f => f.type.includes('image/'));
    if (!valid.length) {
        if (files.length > 0) showToast('请选择图片文件（JPG/PNG）', 'warning');
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
                imageFiles = imageFiles.filter(i => i.id !== rid);
                div.remove();
                // 更新计数文字
                let countEl = container.parentElement.querySelector('.upload-count');
                if (countEl) {
                    if (imageFiles.length === 0) {
                        countEl.remove();
                    } else {
                        countEl.textContent = `已上传 ${imageFiles.length} 张图片`;
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
            countEl.style.cssText = 'font-size:12px;color:var(--text-muted);margin:4px 0;';
            container.parentElement.insertBefore(countEl, container.nextSibling);
        }
        countEl.textContent = `已上传 ${results.filter(Boolean).length} 张图片`;
        cb(imageFiles);
    });
}

// ===== 通用上传初始化 =====
function initUpload(areaId, fileId, previewId, cb) {
    const area = document.getElementById(areaId),
        input = document.getElementById(fileId),
        container = document.getElementById(previewId);
    if (!area || !input) return;
    area.addEventListener('click', () => input.click());
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
    status.textContent = `准备识别 0/${totalImages}`;
}

function updateOcrProgress(currentIndex, total, progressFraction, statusText = '') {
    const fill = document.getElementById('ocrProgressFill');
    const status = document.getElementById('ocrProgressStatus');
    const percent = document.getElementById('ocrProgressPercent');
    if (!fill || !status) return;
    const perImageWeight = 1 / total;
    const done = currentIndex * perImageWeight;
    const currentPart = progressFraction * perImageWeight;
    const overall = Math.min((done + currentPart) * 100, 100).toFixed(0);
    fill.style.width = overall + '%';
    percent.textContent = overall + '%';
    status.textContent = statusText || `识别中 ${currentIndex+1}/${total}`;
}

function hideOcrProgress() {
    const container = document.getElementById('ocrProgressContainer');
    if (container) container.classList.remove('active');
}

// ===== OCR识别 =====
async function ocrWithTesseract(file, index, total) {
    return new Promise((resolve, reject) => {
        Tesseract.recognize(file, 'chi_sim+eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    updateOcrProgress(index, total, m.progress || 0,
                        `识别图片 ${index+1}/${total} (${Math.round((m.progress||0)*100)}%)`);
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
        showToast('OCR 正在运行中，请勿重复点击', 'warning');
        return;
    }
    isOcrRunning = true;
    try {
    // 确保Tesseract已加载
    await loadTesseract();
    if (typeof Tesseract === 'undefined') {
        showToast('Tesseract.js 尚未加载完成，请稍后再试。', 'error');
        return;
    }
    let ocrDiv = document.getElementById('ocrResult');
    let fraudTextarea = document.getElementById('fraudText');
    let allText = [];
    showOcrProgress(images.length);
    for (let i = 0; i < images.length; i++) {
        updateOcrProgress(i, images.length, 0, `正在识别图片 ${i+1}/${images.length}`);
        try {
            const recognized = await ocrWithTesseract(images[i].file, i, images.length);
            if (recognized) allText.push(`【图片${i+1}】\n${recognized}`);
        } catch (err) {
            allText.push(`【图片${i+1}】识别失败`);
        }
        updateOcrProgress(i, images.length, 1, `图片 ${i+1}/${images.length} 完成`);
    }
    hideOcrProgress();
    let combined = allText.join('\n\n');
    if (!combined.trim()) {
        isOcrRunning = false;
        ocrDiv.innerHTML = `⚠️ 未识别到任何文字`;
        return;
    }
    if (document.getElementById('desensitizeSwitch').checked) combined = desensitizeText(combined);
    fraudTextarea.value = fraudTextarea.value ? fraudTextarea.value + "\n\n" + combined : combined;
    globalOcrText = combined;
    ocrDiv.innerHTML = `✅ Tesseract OCR 完成，已填入文本框。证据文本已暂存，可在报案填报中引用。`;
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
    area.addEventListener('click', () => input.click());
    input.addEventListener('change', e => {
        let file = e.target.files[0];
        if (!file) return;
        let reader = new FileReader();
        reader.onload = ev => {
            let ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'csv') {
                billData = { raw: ev.target.result, type: 'csv' };
            } else {
                try {
                    let wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
                    billData = { raw: wb, type: 'xlsx' };
                } catch (e) {
                    showToast('文件格式错误，无法解析Excel文件。', 'error');
                    return;
                }
            }
            showToast('账单已上传', 'success');
        };
        ext === 'csv' ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
    });
}

// 暴露给全局
window.identifyImages = identifyImages;
window.reportImages = reportImages;
window.billData = billData;
window.handleFiles = handleFiles;
window.initUpload = initUpload;
window.ocrImagesWithTesseract = ocrImagesWithTesseract;
window.initImageUpload = initImageUpload;
window.initBillUpload = initBillUpload;
window.showOcrProgress = showOcrProgress;
window.updateOcrProgress = updateOcrProgress;
window.hideOcrProgress = hideOcrProgress;
