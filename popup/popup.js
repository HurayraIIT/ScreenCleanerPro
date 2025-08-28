// popup.js
// Firefox-compatible popup script
var browserAPI = typeof browser !== 'undefined' ? browser : chrome;

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

function getMatchCount(rule) {
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
}

function renderRules(domain, domainData, globalEnabled, previewMode) {
  var ruleList = document.getElementById('rule-list');
  var noRulesMsg = document.getElementById('no-rules-msg');
  ruleList.innerHTML = '';
  if (!domainData || !domainData.rules.length) {
    noRulesMsg.style.display = '';
    return;
  }
  noRulesMsg.style.display = 'none';
  // Request match counts from content script
  browserAPI.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    browserAPI.tabs.sendMessage(tabs[0].id, { type: 'getRuleMatchCounts', rules: domainData.rules }, function(countsResp) {
      var counts = (countsResp && countsResp.counts) || [];
      domainData.rules.forEach(function(rule, idx) {
        var li = document.createElement('li');
        var name = document.createElement('span');
        name.className = 'rule-name';
        name.textContent = rule.name;
        var countSpan = document.createElement('span');
        countSpan.className = 'rule-count';
        countSpan.textContent = ' (' + (counts[idx] || 0) + ')';
        var toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.className = 'rule-toggle';
        toggle.checked = rule.active;
        toggle.setAttribute('aria-label', 'Toggle rule: ' + rule.name);
        toggle.onchange = function() {
          browserAPI.runtime.sendMessage({ type: 'updateRule', domain: domain, ruleId: rule.id, updates: { active: toggle.checked } }, function() {
            browserAPI.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              browserAPI.tabs.sendMessage(tabs[0].id, { type: 'refreshRules' });
            });
          });
        };
        li.appendChild(name);
        li.appendChild(countSpan);
        li.appendChild(toggle);
        ruleList.appendChild(li);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  browserAPI.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var domain = getDomainFromUrl(tabs[0].url);
    browserAPI.runtime.sendMessage({ type: 'getRules' }, function(resp) {
      var data = resp.data;
      document.getElementById('domain-name').textContent = domain;
      document.getElementById('global-switch').checked = data.globalEnabled;
      document.getElementById('preview-switch').checked = data.previewMode;
      renderRules(domain, data.domains[domain], data.globalEnabled, data.previewMode);
    });
  });

  document.getElementById('global-switch').onchange = function(e) {
    browserAPI.runtime.sendMessage({ type: 'setGlobalEnabled', value: e.target.checked }, function() {
      browserAPI.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        browserAPI.tabs.sendMessage(tabs[0].id, { type: 'refreshRules' });
      });
    });
  };
  document.getElementById('preview-switch').onchange = function(e) {
    browserAPI.runtime.sendMessage({ type: 'setPreviewMode', value: e.target.checked }, function() {
      browserAPI.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        browserAPI.tabs.sendMessage(tabs[0].id, { type: 'refreshRules' });
      });
    });
  };
  document.getElementById('options-link').onclick = function() {
    if (browserAPI.runtime.openOptionsPage) {
      browserAPI.runtime.openOptionsPage();
    } else {
      window.open('options/options.html');
    }
  };
});
