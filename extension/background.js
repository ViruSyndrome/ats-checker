// Service worker — keep alive for messaging; extraction runs in content / popup scripting.

chrome.runtime.onInstalled.addListener(() => {
  // No network calls. Extension only helps paste a job description into GetATSReady.
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'PING') {
    sendResponse({ ok: true });
    return false;
  }
  return false;
});
