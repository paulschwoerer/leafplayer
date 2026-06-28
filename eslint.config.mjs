// @ts-check

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default defineConfig({
  files: ['./**/*.{js,ts}'],
  ignores: ['./web/**'],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
  extends: [
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
  ],
  rules: {
    'no-return-await': 'warn',
    'no-await-in-loop': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { caughtErrors: 'none' }],
    '@typescript-eslint/require-await': 'warn',
    'import/no-unresolved': 'off',
    'import/extensions': ['error', 'always'],
    'import/named': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        'newlines-between': 'always',
      },
    ],
  },
});
