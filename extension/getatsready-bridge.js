/**
 * On getatsready.com: read JD saved by the popup and fill the textarea.
 * Web pages cannot read chrome.storage alone — this content script bridges it.
 */

(function fillFromExtensionStorage() {
  const KEY = 'getatsready_jd';

  function applyJd(text) {
    const cleaned = String(text || '').trim();
    if (!cleaned) return false;

    const area =
      document.getElementById('jobDescription') ||
      document.querySelector('textarea#jobDescription') ||
      document.querySelector('textarea[aria-label="Job Description"]');

    if (area) {
      area.value = cleaned;
      area.dispatchEvent(new Event('input', { bubbles: true }));
      area.dispatchEvent(new Event('change', { bubbles: true }));
    }

    window.__getatsreadyExtensionJd = cleaned;
    try {
      document.dispatchEvent(new CustomEvent('getatsready:jd', { detail: cleaned }));
    } catch (e) { /* ignore */ }

    // Lightweight toast if page helper is not ready yet
    if (!document.getElementById('global-inline-alert')) {
      const toast = document.createElement('div');
      toast.textContent = 'Job description loaded from extension';
      toast.style.cssText =
        'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#ecfdf5;color:#047857;border:1px solid #34d399;padding:10px 20px;border-radius:6px;z-index:10000;font-weight:500;font-family:sans-serif;';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    }

    return true;
  }

  chrome.storage.local.get([KEY], (data) => {
    const jd = data && data[KEY];
    if (!jd) return;
    const tryFill = () => {
      if (applyJd(jd)) {
        chrome.storage.local.remove([KEY]);
        return true;
      }
      return false;
    };
    if (!tryFill()) {
      // SPA / late DOM
      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        if (tryFill() || attempts > 20) clearInterval(timer);
      }, 250);
    }
  });
})();
