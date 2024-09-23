chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId === 0) { // Ensure it's the main frame (not iframes)
    chrome.tabs.sendMessage(details.tabId, {
      message: 'url_changed',
      url: details.url
    });
  }
});
