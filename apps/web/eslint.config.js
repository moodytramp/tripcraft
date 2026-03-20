import preset from '@tripcraft/config/eslint-preset.js';
import globals from 'globals';

export default [
  ...preset,
  {
    // Next.js server components and actions run in Node.js;
    // client components and pages use browser APIs.
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
