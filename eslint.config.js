const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
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
