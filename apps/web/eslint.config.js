import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      react,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Prevent form fields with value but no onChange
      'react-hooks/exhaustive-deps': 'error',
      // React-specific rules
      'react/no-unknown-property': 'error',
      // Custom rule to catch common React issues
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      // Prevent invalid DOM props
      'no-restricted-syntax': [
        'error',
        {
          'selector': 'JSXAttribute[name.name="textAlign"]',
          'message': 'Use textAlign in style prop or CSS instead of as a direct DOM attribute'
        },
        {
          'selector': 'JSXAttribute[name.name="onChangeText"]',
          'message': 'Use onChange instead of onChangeText for web compatibility'
        },
        {
          'selector': 'JSXAttribute[name.name="fontFamily"]',
          'message': 'Ensure fontFamily is properly handled for web'
        }
      ]
    },
  },
])
