// presets.js
// ...initial scaffolding for pre-installed rules...

// Pre-installed rules for popular websites
var PRESET_RULES = [
  {
    domain: "www.linkedin.com",
    rules: [
      {
        name: "Home > LinkedIn Footer",
        selector: "//footer[@aria-label='LinkedIn Footer Content']/../..",
        type: "xpath"
      },
      {
        name: "Home > Today's Puzzle games",
        selector: "//h2[@id='todays-games-entrypoint-title']/ancestor::div[@class='pv3']/ancestor::div[@class='mb2']",
        type: "xpath"
      },
      {
        name: "Home > Add to your feed",
        selector: "//div[@class='feed-follows-module']/ancestor::div[@class='mb2']",
        type: "xpath"
      }
    ]
  },
  {
    domain: "www.dailyamardesh.com",
    rules: [
      {
        name: "Bottom Anchor Ad",
        selector: "div.shadow-anchorAdShadow",
        type: "css"
      },
      {
        name: "Header",
        selector: "//div[@class='elem1']",
        type: "xpath"
      }
    ]
  },
  {
    domain: "hikmah.net",
    rules: [
      {
        name: "You may follow section",
        selector: "//h3[normalize-space(text())='You May Follow']/../..",
        type: "xpath"
      }
    ]
  }
];
// Make available globally
if (typeof window !== 'undefined') window.PRESET_RULES = PRESET_RULES;
if (typeof global !== 'undefined') global.PRESET_RULES = PRESET_RULES;
