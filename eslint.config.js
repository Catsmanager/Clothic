// Expo 56 + ESLint 9 flat config
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const eslintConfigPrettier = require('eslint-config-prettier')

module.exports = defineConfig([
  expoConfig,
  // Prettier와 충돌하는 포매팅 규칙 비활성화 (포매팅은 Prettier가 담당)
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'assets/*'],
  },
])
