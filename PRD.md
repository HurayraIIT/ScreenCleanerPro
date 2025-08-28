# ScreenCleanerPro - Product Requirements Document

## 1. Project Overview

### 1.1 Product Name
**ScreenCleanerPro** - Cross-Browser Website Element Removal Extension

### 1.2 Purpose
A browser extension that automatically removes unwanted webpage sections (ads, promoted content, suggestions, etc.) based on user-defined and pre-installed rules using CSS selectors and XPath expressions.

### 1.3 Target Browsers
- Google Chrome (Manifest V3)
- Mozilla Firefox (Manifest V2/V3)

### 1.4 Version
Initial Release: v1.0.0

## 2. Core Features

### 2.1 Rule Management System
- **Domain-Specific Rules**: Each exact domain has its own set of rules
- **Dual Selector Support**: CSS selectors and XPath expressions
- **Rule States**: Active/Inactive toggle for each rule
- **Pre-installed Rules**: Hardcoded rules for popular websites
- **User Custom Rules**: Add, edit, delete custom rules
- **Local Storage**: All rules and preferences stored locally

### 2.2 User Interface Components
- **Popup Interface**: Shows current domain rules with quick toggles
- **Options Page**: Advanced rule management interface
- **Preview Mode**: Highlight elements that would be removed
- **Global Controls**: Master on/off switch for all rules

### 2.3 Core Functionality
- **Auto-Execution**: Runs on all websites by default
- **DOM Manipulation**: Completely removes matched elements from DOM
- **Real-time Updates**: Rules apply immediately when toggled
- **Export Capability**: Download all rules as a single JSON file

## 3. Technical Specifications

### 3.1 File Structure
```
ScreenCleanerPro/
├── manifest.json
├── background.js (service worker)
├── content.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon512.png
├── rules/
│   └── presets.js
└── README.md
```

### 3.2 Permissions Required
- `storage`: For local rule storage
- `activeTab`: For current tab access
- `scripting`: For content script injection
- `host_permissions`: ["<all_urls>"] for all websites

### 3.3 Data Storage Schema
```javascript
{
  "globalEnabled": true,
  "previewMode": false,
  "domains": {
    "www.linkedin.com": {
      "enabled": true,
      "rules": [
        {
          "id": "rule_001",
          "name": "Promoted Posts",
          "selector": ".feed-shared-update-v2--sponsored",
          "type": "css",
          "active": true,
          "preset": true
        }
      ]
    }
  }
}
```

## 4. User Stories

### 4.1 Primary User Stories
1. **As a user**, I want to remove LinkedIn's promoted posts so I can focus on organic content
2. **As a user**, I want to hide news website ads so I can read articles without distractions
3. **As a user**, I want to customize which elements are removed per website
4. **As a user**, I want to temporarily disable all rules to see the original page
5. **As a user**, I want to preview what would be removed before applying rules

### 4.2 Secondary User Stories
1. **As a user**, I want to export my custom rules for backup purposes
2. **As a user**, I want to edit pre-installed rules to match my preferences
3. **As a user**, I want quick access to current domain rules from the browser toolbar

## 5. Pre-installed Rules

### 5.1 LinkedIn (www.linkedin.com)
```javascript
{
  "domain": "www.linkedin.com",
  "rules": [
    {
      "name": "Promoted Posts",
      "selector": ".feed-shared-update-v2--sponsored",
      "type": "css"
    },
    {
      "name": "People You May Know",
      "selector": "//div[contains(@class, 'pymk-list')]",
      "type": "xpath"
    },
    {
      "name": "LinkedIn Learning Ads",
      "selector": ".learning-path-entity",
      "type": "css"
    }
  ]
}
```

### 5.2 Daily Amardesh (www.dailyamardesh.com)
```javascript
{
  "domain": "www.dailyamardesh.com",
  "rules": [
    {
      "name": "Sidebar Ads",
      "selector": ".advertisement",
      "type": "css"
    },
    {
      "name": "Banner Ads",
      "selector": "//div[@class='banner-ad']",
      "type": "xpath"
    }
  ]
}
```

### 5.3 Hikmah (hikmah.net)
```javascript
{
  "domain": "hikmah.net",
  "rules": [
    {
      "name": "Google Ads",
      "selector": ".google-ad-container",
      "type": "css"
    },
    {
      "name": "Popup Overlays",
      "selector": "//div[contains(@class, 'popup-overlay')]",
      "type": "xpath"
    }
  ]
}
```

## 6. User Interface Design

### 6.1 Popup Interface
- **Header**: Current domain name and global toggle
- **Rule List**: Scrollable list of domain-specific rules
- **Rule Items**: Name, toggle switch, edit button
- **Footer**: Preview mode toggle, options page link

### 6.2 Options Page
- **Navigation**: Tabs for different domains
- **Rule Management**: Add, edit, delete rules
- **Global Settings**: Master controls and export
- **Help Section**: Usage instructions and examples

### 6.3 Visual Design
- **Color Scheme**: Light theme with accent colors
- **Typography**: Clean, readable fonts
- **Icons**: Consistent iconography throughout
- **Responsive**: Works on different screen sizes

## 7. Technical Implementation Details

### 7.1 Rule Processing Flow
1. Content script loads on page
2. Retrieve domain-specific rules from storage
3. Check global enabled state and rule active states
4. Apply CSS selectors using `document.querySelectorAll()`
5. Apply XPath selectors using `document.evaluate()`
6. Remove matched elements from DOM
7. Handle preview mode highlighting

### 7.2 Cross-Browser Compatibility
```javascript
// Browser API wrapper
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Storage access
browserAPI.storage.local.get()
browserAPI.storage.local.set()

// Tab messaging
browserAPI.tabs.sendMessage()
```

### 7.3 Performance Considerations
- **Debounced Execution**: Prevent excessive DOM manipulation
- **Efficient Selectors**: Optimize CSS/XPath for speed
- **Memory Management**: Clean up observers and listeners
- **Lazy Loading**: Load rules only when needed

## 8. Testing Strategy

### 8.1 Browser Testing
- Chrome latest stable
- Firefox latest stable
- Cross-browser functionality verification
- Extension loading and installation

### 8.2 Functionality Testing
- Rule creation and management
- Element removal accuracy
- Preview mode functionality
- Storage persistence
- Export feature

### 8.3 Performance Testing
- Page load impact measurement
- Memory usage monitoring
- CPU usage during rule execution
- Large rule set handling

## 9. Installation Instructions

### 9.1 Development Mode - Chrome
1. Open Chrome Extensions (`chrome://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select extension directory
5. Verify installation and permissions

### 9.2 Development Mode - Firefox
1. Open Firefox Add-ons (`about:debugging`)
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json`
5. Verify installation and permissions

### 9.3 Testing Checklist
- [ ] Extension icon appears in toolbar
- [ ] Popup opens and displays correctly
- [ ] Options page accessible and functional
- [ ] Rules apply on target websites
- [ ] Storage persists between sessions
- [ ] Preview mode works correctly

## 10. Future Enhancements (Post v1.0)

### 10.1 Planned Features
- Visual element picker (click-to-select)
- Rule sharing and community sets
- Advanced scheduling (time-based rules)
- Statistics and usage analytics
- Cloud sync for rule backup

### 10.2 Technical Improvements
- Rule performance optimization
- Better error handling and logging
- Automated rule updates
- Advanced XPath/CSS builder UI

## 11. Development Timeline

### 11.1 Phase 1 - Core Development (2 weeks)
- Basic extension structure
- Rule management system
- Content script implementation
- Storage functionality

### 11.2 Phase 2 - UI Development (1 week)
- Popup interface
- Options page
- CSS styling and responsive design

### 11.3 Phase 3 - Testing & Polish (1 week)
- Cross-browser testing
- Pre-installed rule implementation
- Performance optimization
- Documentation completion

## 12. Success Metrics

### 12.1 Technical Metrics
- Extension loads without errors on both browsers
- Rules apply successfully with 99%+ accuracy
- Page load impact < 100ms additional time
- Memory usage < 50MB per tab

### 12.2 User Experience Metrics
- Setup time < 5 minutes for basic usage
- Rule creation time < 2 minutes per rule
- Zero crashes or data loss incidents
- Positive user feedback on functionality

---

**Document Version**: 1.0  
**Last Updated**: August 28, 2025  
**Author**: Abu Hurayra - https://github.com/HurayraIIT
