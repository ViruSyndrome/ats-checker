/**
 * Extract job description text from common ATS / board layouts.
 * Fallback: largest visible text block. Does not submit applications or bypass ATS.
 */

function visibleText(el) {
  if (!el) return '';
  const style = window.getComputedStyle(el);
  if (style && (style.display === 'none' || style.visibility === 'hidden')) return '';
  return (el.innerText || el.textContent || '').replace(/\s+\n/g, '\n').trim();
}

function pickLargestBlock(root, minLen) {
  const candidates = root.querySelectorAll('article, main, section, div[role="main"], div');
  let best = '';
  candidates.forEach(node => {
    if (node.querySelectorAll('div').length > 40) return; // skip huge wrappers
    const t = visibleText(node);
    if (t.length > best.length && t.length >= minLen) best = t;
  });
  return best;
}

function extractJobDescription() {
  const selectors = [
    // LinkedIn
    '.jobs-description__content',
    '.jobs-description-content__text',
    '.jobs-box__html-content',
    '#job-details',
    '.job-details-module',
    // Greenhouse
    '#content',
    '#app_body',
    '.job__description',
    '.content-wrapper .content',
    // Lever
    '.posting-description',
    '.section-wrapper .section-page',
    '[data-qa="job-description"]',
    // Ashby
    '[class*="JobDescription"]',
    '[class*="job-description"]',
    'div[class*="description"]',
    // Generic
    'article',
    'main',
    '[itemprop="description"]'
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = visibleText(el);
    if (text && text.length > 180) {
      return { text, source: sel };
    }
  }

  const fallback = pickLargestBlock(document.body, 280);
  if (fallback) return { text: fallback, source: 'largest-block' };

  return { text: visibleText(document.body).slice(0, 50000), source: 'body' };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== 'EXTRACT_JD') return false;
  try {
    const result = extractJobDescription();
    sendResponse({ ok: true, ...result });
  } catch (err) {
    sendResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  }
  return true;
});
