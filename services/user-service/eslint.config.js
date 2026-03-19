import preset from '@tripcraft/config/eslint-preset.js';
import globals from 'globals';

export default [
  ...preset,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
