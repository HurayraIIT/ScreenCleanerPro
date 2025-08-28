// options.js
// Firefox-compatible options script
var browserAPI = typeof browser !== 'undefined' ? browser : chrome;
var currentDomain = null;

function renderDomains(domains) {
  var nav = document.getElementById('domain-tabs');
  nav.innerHTML = '';
  Object.keys(domains).forEach(function(domain, idx) {
    var btn = document.createElement('button');
    btn.textContent = domain;
    btn.className = (domain === currentDomain || (!currentDomain && idx === 0)) ? 'active' : '';
    btn.onclick = function() {
      currentDomain = domain;
      renderDomains(domains);
      renderRules(domain, domains[domain]);
    };
    nav.appendChild(btn);
  });
}

function renderRules(domain, domainData) {
  var ruleList = document.getElementById('rule-list');
  var noRulesMsg = document.getElementById('no-rules-msg');
  ruleList.innerHTML = '';
  if (!domainData || !domainData.rules.length) {
    noRulesMsg.style.display = '';
    return;
  }
  noRulesMsg.style.display = 'none';
  domainData.rules.forEach(function(rule) {
    var li = document.createElement('li');
    var name = document.createElement('span');
    name.className = 'rule-name';
    name.textContent = rule.name + ' (' + rule.type + ')';
    var editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function() { editRule(domain, rule); };
    var delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = function() {
      browserAPI.runtime.sendMessage({ type: 'deleteRule', domain: domain, ruleId: rule.id }, function() { location.reload(); });
    };
    li.appendChild(name);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    ruleList.appendChild(li);
  });
}

function editRule(domain, rule) {
  // Show edit form (implementation depends on your HTML)
  // On save, send updateRule message
  alert('Edit functionality coming soon!');
}

document.addEventListener('DOMContentLoaded', function() {
  browserAPI.runtime.sendMessage({ type: 'getRules' }, function(resp) {
    var data = resp.data;
    var domains = data.domains;
    var firstDomain = Object.keys(domains)[0];
    currentDomain = firstDomain;
    renderDomains(domains);
    if (firstDomain) renderRules(firstDomain, domains[firstDomain]);
    document.getElementById('export-btn').onclick = function() {
      browserAPI.runtime.sendMessage({ type: 'exportRules' }, function(resp) {
        var blob = new Blob([resp.json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'ScreenCleanerPro_rules.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    };
  });
});
