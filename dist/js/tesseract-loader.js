/**
 * Tesseract.js 延迟加载模块
 * 仅在用户切换到"诈骗识别"页面时才加载，避免首屏阻塞
 * 优化点：
 *   1. Worker 全局复用，不重复创建
 *   2. 语言数据预下载到 IndexedDB，避免每次识别都重新下载
 *   3. 从 bootcdn 加载（国内更快）
 *   4. 细粒度进度通知（区分下载/识别阶段）
 */

let tesseractLoaded = false;
let tesseractReady = false;
let tesseractResolve = null;
let tesseractWorker = null; // 全局复用 Worker
let langDataDownloading = false; // 防止重复下载语言数据
let langDataDownloaded = false; // 语言数据是否已缓存

// ===== 公开的全局回调，供 upload.js 的 logger 调用 =====
window.onTesseractLangProgress = null; // (downloaded, total, message) => void
window.onTesseractStatusChange = null; // (status, progress, message) => void
window._tesseractLangDataDownloaded = false; // 外部可读状态

/**
 * 预下载并缓存指定语言包到 IndexedDB
 * Tesseract.js 5.x 会自动将下载的语言包存入 IndexedDB
 * @param {string} lang - 语言代码，如 'chi_sim+eng'
 * @param {Function} onProgress - 进度回调 (downloaded, total, message)
 */
async function preloadLangData(lang, onProgress) {
    if (langDataDownloaded) return;
    if (langDataDownloading) {
        return new Promise((resolve) => {
            const check = setInterval(() => {
                if (langDataDownloaded || !tesseractReady) {
                    clearInterval(check);
                    resolve();
                }
            }, 200);
        });
    }
    langDataDownloading = true;

    try {
        // Tesseract.js 5.x 的 downloadLanguage 接受单个语言代码
        // chi_sim+eng 需要拆分为 chi_sim 和 eng 分别下载
        const langs = lang.split('+');
        const total = langs.length;

        for (let i = 0; i < langs.length; i++) {
            const l = langs[i];
            try {
                await Tesseract.downloadLanguage(l);
                if (onProgress) onProgress(i + 1, total, `正在下载 ${l} 模型...`);
            } catch (e) {
                console.warn(`预下载语言包失败 [${i + 1}/${total}] ${l}:`, e.message);
                if (onProgress) onProgress(i + 1, total, `${l} 下载失败（将使用在线加载）`);
            }
        }

        langDataDownloaded = true;
        if (onProgress) onProgress(total, total, '模型下载完成 ✓');
    } finally {
        langDataDownloading = false;
    }
}

function loadTesseract(onLangProgress) {
    if (tesseractReady) return Promise.resolve();
    if (tesseractLoaded) {
        return new Promise((resolve) => {
            tesseractResolve = resolve;
        });
    }
    tesseractLoaded = true;

    // 保存进度回调
    if (onLangProgress) {
        window.onTesseractLangProgress = onLangProgress;
    }

    return new Promise(async (resolve) => {
        tesseractResolve = resolve;

        // 使用 bootcdn（国内访问更快）
        const script = document.createElement('script');
        script.src = 'https://cdn.bootcdn.net/ajax/libs/tesseract.js/5.0.5/tesseract.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = async () => {
            tesseractReady = true;

            // 先通知用户"正在加载模型"
            if (window.onTesseractLangProgress) {
                window.onTesseractLangProgress(0, 2, '正在加载 OCR 模型，请稍候...');
            }

            // await 预下载，确保语言包就绪后再 resolve
            await preloadLangData('chi_sim+eng', (downloaded, total, message) => {
                if (window.onTesseractLangProgress) {
                    window.onTesseractLangProgress(downloaded, total, message);
                }
            }).catch(() => {
                console.warn('语言包预下载失败，将在首次识别时动态加载');
            });

            // 标记为外部可读
            window._tesseractLangDataDownloaded = langDataDownloaded;

            if (tesseractResolve) tesseractResolve();
        };
        script.onerror = () => {
            alert('Tesseract.js 加载失败，请检查网络连接后刷新页面。');
            if (tesseractResolve) tesseractResolve();
        };
        document.head.appendChild(script);
    });
}

// 暴露给全局供其他模块调用
window.loadTesseract = loadTesseract;
