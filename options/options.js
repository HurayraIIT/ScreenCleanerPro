// options.js
// Firefox-compatible options script
var browserAPI = typeof browser !== 'undefined' ? browser : chrome;
var currentDomain = null;
var domainsCache = {};
var editingRuleId = null;

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
    editBtn.onclick = function() { openRuleModal('edit', domain, rule); };
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

function openRuleModal(mode, domain, rule) {
  var modal = document.getElementById('rule-modal');
  var title = document.getElementById('modal-title');
  var form = document.getElementById('rule-form');
  var nameInput = document.getElementById('rule-name');
  var selectorInput = document.getElementById('rule-selector');
  var typeInput = document.getElementById('rule-type');
  var activeInput = document.getElementById('rule-active');
  editingRuleId = null;
  if (mode === 'edit' && rule) {
    title.textContent = 'Edit Rule';
    nameInput.value = rule.name;
    selectorInput.value = rule.selector;
    typeInput.value = rule.type;
    activeInput.checked = rule.active !== false;
    editingRuleId = rule.id;
  } else {
    title.textContent = 'Add Rule';
    nameInput.value = '';
    selectorInput.value = '';
    typeInput.value = 'css';
    activeInput.checked = true;
    editingRuleId = null;
  }
  modal.style.display = 'flex';
  form.onsubmit = function(e) {
    e.preventDefault();
    var ruleData = {
      name: nameInput.value.trim(),
      selector: selectorInput.value.trim(),
      type: typeInput.value,
      active: activeInput.checked,
      id: editingRuleId || ('user_' + Date.now() + '_' + Math.floor(Math.random()*10000)),
      preset: false
    };
    if (!ruleData.name || !ruleData.selector) {
      alert('Name and selector are required.');
      return;
    }
    if (editingRuleId) {
      browserAPI.runtime.sendMessage({ type: 'updateRule', domain: currentDomain, ruleId: editingRuleId, updates: ruleData }, function() {
        modal.style.display = 'none';
        location.reload();
      });
    } else {
      browserAPI.runtime.sendMessage({ type: 'addRule', domain: currentDomain, rule: ruleData }, function() {
        modal.style.display = 'none';
        location.reload();
      });
    }
  };
}

document.getElementById('close-modal').onclick = function() {
  document.getElementById('rule-modal').style.display = 'none';
};
window.onclick = function(event) {
  var modal = document.getElementById('rule-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

document.addEventListener('DOMContentLoaded', function() {
  browserAPI.runtime.sendMessage({ type: 'getRules' }, function(resp) {
    var data = resp.data;
    var domains = data.domains;
    domainsCache = domains;
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
    document.getElementById('add-rule-btn').onclick = function() {
      openRuleModal('add', currentDomain);
    };
  });
});
