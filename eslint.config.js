import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'always'],
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
