import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: [
    'typescript',
    'unicorn',
    'oxc',
  ],
  categories: {
    correctness: 'error',
  },
  rules: {
    'eslint/comma-dangle': ['warn', 'always-multiline'],
    'eslint/eol-last': ['warn', 'always'],
    'eslint/object-curly-spacing': ['warn', 'always'],
    'eslint/quotes': ['warn', 'single', { avoidEscape: true }],
    'eslint/semi': ['warn', 'never'],
    'eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  env: {
    builtin: true,
  },
})
