import { config } from "@remotion/eslint-config-flat";
import globals from "globals";

export default [
  ...config,
  {
    files: ["scripts/**"],
    languageOptions: {
      // `document` is only read inside Playwright `page.evaluate` callbacks, which run in the browser.
      globals: { ...globals.node, document: "readonly" },
    },
    rules: {
      // lib.mjs probes several playwright install paths and ignores the ones that fail.
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
];
