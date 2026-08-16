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
