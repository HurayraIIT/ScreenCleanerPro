// background.js (service worker)
// Firefox-compatible background script
var browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// --- Rule Management Core ---
var DEFAULT_STORAGE = {
  globalEnabled: true,
  previewMode: false,
  domains: {}
};

// Load presets (imported via <script> in manifest/options/background)
if (typeof PRESET_RULES === 'undefined' && typeof window !== 'undefined') {
  // fallback for global
  PRESET_RULES = window.PRESET_RULES || [];
}

function getStorage() {
  return new Promise(resolve => {
    browserAPI.storage.local.get(null, function(data) {
      resolve(Object.assign({}, DEFAULT_STORAGE, data));
    });
  });
}

function setStorage(data) {
  return new Promise(resolve => {
    browserAPI.storage.local.set(data, resolve);
  });
}

async function addRule(domain, rule) {
  var data = await getStorage();
  if (!data.domains[domain]) data.domains[domain] = { enabled: true, rules: [] };
  data.domains[domain].rules.push(rule);
  await setStorage(data);
}

async function updateRule(domain, ruleId, updates) {
  var data = await getStorage();
  var rules = data.domains[domain]?.rules || [];
  var idx = rules.findIndex(function(r) { return r.id === ruleId; });
  if (idx !== -1) {
    rules[idx] = Object.assign({}, rules[idx], updates);
    await setStorage(data);
  }
}

async function deleteRule(domain, ruleId) {
  var data = await getStorage();
  if (!data.domains[domain]) return;
  data.domains[domain].rules = data.domains[domain].rules.filter(function(r) { return r.id !== ruleId; });
  await setStorage(data);
}

async function exportRules() {
  var data = await getStorage();
  return JSON.stringify(data, null, 2);
}

browserAPI.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.type === 'getRules') {
    getStorage().then(function(data) { sendResponse({ data: data }); });
    return true;
  }
  if (msg.type === 'addRule') {
    addRule(msg.domain, msg.rule).then(function() { sendResponse({ success: true }); });
    return true;
  }
  if (msg.type === 'updateRule') {
    updateRule(msg.domain, msg.ruleId, msg.updates).then(function() { sendResponse({ success: true }); });
    return true;
  }
  if (msg.type === 'deleteRule') {
    deleteRule(msg.domain, msg.ruleId).then(function() { sendResponse({ success: true }); });
    return true;
  }
  if (msg.type === 'exportRules') {
    exportRules().then(function(json) { sendResponse({ json: json }); });
    return true;
  }
  if (msg.type === 'setGlobalEnabled') {
    getStorage().then(function(data) {
      data.globalEnabled = msg.value;
      setStorage(data).then(function() { sendResponse({ success: true }); });
    });
    return true;
  }
  if (msg.type === 'setPreviewMode') {
    getStorage().then(function(data) {
      data.previewMode = msg.value;
      setStorage(data).then(function() { sendResponse({ success: true }); });
    });
    return true;
  }
});

// On install: load presets if not present
if (browserAPI.runtime && browserAPI.runtime.onInstalled) {
  browserAPI.runtime.onInstalled.addListener(async function() {
    var data = await getStorage();
    if (Object.keys(data.domains).length === 0 && typeof PRESET_RULES !== 'undefined') {
      for (var i = 0; i < PRESET_RULES.length; i++) {
        var preset = PRESET_RULES[i];
        data.domains[preset.domain] = {
          enabled: true,
          rules: preset.rules.map(function(r, j) {
            return Object.assign({}, r, {
              id: 'preset_' + preset.domain.replace(/\W/g, '') + '_' + j,
              active: true,
              preset: true
            });
          })
        };
      }
      await setStorage(data);
    }
  });
}
