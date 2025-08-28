// Firefox-compatible content script
var browserAPI = typeof browser !== 'undefined' ? browser : chrome;

function getDomain() {
  return window.location.hostname;
}

function hideElement(el) {
  if (!el.dataset.screencleanerproHidden) {
    el.dataset.screencleanerproDisplay = el.style.display;
    el.style.display = 'none';
    el.dataset.screencleanerproHidden = '1';
  }
}

function showElement(el) {
  if (el.dataset.screencleanerproHidden) {
    el.style.display = el.dataset.screencleanerproDisplay || '';
    delete el.dataset.screencleanerproHidden;
    delete el.dataset.screencleanerproDisplay;
  }
}

function highlightElement(el) {
  el.style.outline = '2px dashed #ff9800';
}

function removeHighlight(el) {
  el.style.outline = '';
}

function applyRules(rules, previewMode) {
  rules.forEach(function(rule) {
    if (!rule.active) {
      // Restore elements if rule is inactive
      if (rule.type === 'css') {
        document.querySelectorAll(rule.selector).forEach(showElement);
      } else if (rule.type === 'xpath') {
        var xpathResult = document.evaluate(rule.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < xpathResult.snapshotLength; i++) {
          var el = xpathResult.snapshotItem(i);
          if (el) showElement(el);
        }
      }
      return;
    }
    if (rule.type === 'css') {
      document.querySelectorAll(rule.selector).forEach(function(el) {
        if (previewMode) {
          showElement(el);
          highlightElement(el);
        } else {
          removeHighlight(el);
          hideElement(el);
        }
      });
    } else if (rule.type === 'xpath') {
      var xpathResult = document.evaluate(rule.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (var i = 0; i < xpathResult.snapshotLength; i++) {
        var el = xpathResult.snapshotItem(i);
        if (el) {
          if (previewMode) {
            showElement(el);
            highlightElement(el);
          } else {
            removeHighlight(el);
            hideElement(el);
          }
        }
      }
    }
  });
}

function clearPreview(rules) {
  rules.forEach(function(rule) {
    if (rule.type === 'css') {
      document.querySelectorAll(rule.selector).forEach(removeHighlight);
    } else if (rule.type === 'xpath') {
      var xpathResult = document.evaluate(rule.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (var i = 0; i < xpathResult.snapshotLength; i++) {
        var el = xpathResult.snapshotItem(i);
        if (el) removeHighlight(el);
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
  if (msg.type === 'getRuleMatchCounts' && Array.isArray(msg.rules)) {
    var counts = msg.rules.map(function(rule) {
      try {
        if (rule.type === 'css') {
          return document.querySelectorAll(rule.selector).length;
        } else if (rule.type === 'xpath') {
          var xpathResult = document.evaluate(rule.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          return xpathResult.snapshotLength;
        }
      } catch (e) {
        return 0;
      }
      return 0;
    });
    sendResponse({ counts: counts });
    return true;
  }
});

fetchAndApply();
