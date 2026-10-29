const TARGET = 'https://www.getatsready.com/?utm_source=extension';
const STORAGE_KEY = 'getatsready_jd';

const statusEl = document.getElementById('status');
const sendBtn = document.getElementById('sendBtn');
const copyBtn = document.getElementById('copyBtn');

function setStatus(msg, kind) {
  statusEl.textContent = msg || '';
  statusEl.className = kind || '';
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs[0];
}

async function extractFromTab(tab) {
  if (!tab || !tab.id) throw new Error('No active tab.');
  const url = tab.url || '';
  if (!/^https?:/i.test(url)) {
    throw new Error('Open a job posting page (http/https), then try again.');
  }

  // Prefer messaging an injected content script; fall back to executeScript.
  try {
    const viaMsg = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_JD' });
    if (viaMsg && viaMsg.ok && viaMsg.text) return viaMsg.text;
  } catch (_e) {
    // Content script may not be on this host yet.
  }

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const visibleText = (el) => {
        if (!el) return '';
        return (el.innerText || el.textContent || '').replace(/\s+\n/g, '\n').trim();
      };
      const selectors = [
        '.jobs-description__content',
        '.jobs-description-content__text',
        '.jobs-box__html-content',
        '#job-details',
        '#content',
        '.posting-description',
        '[data-qa="job-description"]',
        '[itemprop="description"]',
        'article',
        'main'
      ];
      for (const sel of selectors) {
        const t = visibleText(document.querySelector(sel));
        if (t && t.length > 180) return t;
      }
      let best = '';
      document.querySelectorAll('article, main, section, div').forEach((node) => {
        const t = visibleText(node);
        if (t.length > best.length && t.length > 280 && node.querySelectorAll('div').length < 40) {
          best = t;
        }
      });
      return best || visibleText(document.body).slice(0, 50000);
    }
  });

  if (!result || String(result).trim().length < 40) {
    throw new Error('Could not find enough job description text on this page.');
  }
  return String(result).trim();
}

async function sendToGetAtsReady() {
  sendBtn.disabled = true;
  copyBtn.disabled = true;
  setStatus('Grabbing job description…');
  try {
    const tab = await getActiveTab();
    const text = await extractFromTab(tab);
    await chrome.storage.local.set({ [STORAGE_KEY]: text });

    // Hash backup for environments where the bridge content script is blocked.
    // Prefer storage (handles long JDs); hash is a secondary path.
    let openUrl = TARGET;
    try {
      if (text.length < 6000) {
        openUrl = TARGET + '#jd=' + encodeURIComponent(text);
      }
    } catch (_e) {
      openUrl = TARGET;
    }

    await chrome.tabs.create({ url: openUrl });
    setStatus('Opened GetATSReady with this JD.', 'ok');
  } catch (err) {
    setStatus(err && err.message ? err.message : String(err), 'err');
  } finally {
    sendBtn.disabled = false;
    copyBtn.disabled = false;
  }
}

async function copyOnly() {
  sendBtn.disabled = true;
  copyBtn.disabled = true;
  setStatus('Copying…');
  try {
    const tab = await getActiveTab();
    const text = await extractFromTab(tab);
    await navigator.clipboard.writeText(text);
    setStatus('Job description copied to clipboard.', 'ok');
  } catch (err) {
    setStatus(err && err.message ? err.message : String(err), 'err');
  } finally {
    sendBtn.disabled = false;
    copyBtn.disabled = false;
  }
}

sendBtn.addEventListener('click', sendToGetAtsReady);
copyBtn.addEventListener('click', copyOnly);
