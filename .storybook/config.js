import { configure } from "@storybook/react";
import { setOptions } from "@storybook/addon-options";

setOptions({
  name: "INFINITE CALENDAR",
  url: "https://github.com/blacklane/react-infinite-calendar",
  goFullScreen: true,
  showStoriesPanel: false,
  showAddonPanel: false,
  showSearchBox: false,
  addonPanelInRight: false,
  sortStoriesByKind: false
});

configure(() => require("../src/.stories/index.js"), module);
