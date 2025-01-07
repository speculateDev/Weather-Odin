import globals from 'globals';
import pluginJs from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  pluginJs.configs.recommended,

  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'warn',
      'prefer-destructuring': ['error', { object: true, array: false }],
    },
  },

  prettier,
];
