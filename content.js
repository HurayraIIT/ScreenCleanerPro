// Firefox-compatible content script
var browserAPI = typeof browser !== 'undefined' ? browser : chrome;

function getDomain() {
  return window.location.hostname;
}

function applyRules(rules, previewMode) {
  rules.forEach(function(rule) {
    if (!rule.active) return;
    if (rule.type === 'css') {
      document.querySelectorAll(rule.selector).forEach(function(el) {
        if (previewMode) {
          el.style.outline = '2px dashed #ff9800';
        } else {
          el.remove();
        }
      });
    } else if (rule.type === 'xpath') {
      var xpathResult = document.evaluate(rule.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (var i = 0; i < xpathResult.snapshotLength; i++) {
        var el = xpathResult.snapshotItem(i);
        if (el) {
          if (previewMode) {
            el.style.outline = '2px dashed #ff9800';
          } else {
            el.remove();
          }
        }
      }
    }
  });
}

function clearPreview(rules) {
  rules.forEach(function(rule) {
    if (!rule.active) return;
    if (rule.type === 'css') {
      document.querySelectorAll(rule.selector).forEach(function(el) {
        el.style.outline = '';
      });
    } else if (rule.type === 'xpath') {
      var xpathResult = document.evaluate(rule.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (var i = 0; i < xpathResult.snapshotLength; i++) {
        var el = xpathResult.snapshotItem(i);
        if (el) el.style.outline = '';
      }
    }
  });
}

function fetchAndApply() {
  browserAPI.runtime.sendMessage({ type: 'getRules' }, function(resp) {
    var data = resp.data;
    if (!data.globalEnabled) return;
    var domain = getDomain();
    var domainData = data.domains[domain];
    if (!domainData || !domainData.enabled) return;
    clearPreview(domainData.rules || []);
    applyRules(domainData.rules || [], data.previewMode);
  });
}

browserAPI.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.type === 'refreshRules') {
    fetchAndApply();
    sendResponse({ success: true });
    return true;
  }
});

fetchAndApply();
