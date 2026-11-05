import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig([
  { ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'reports/**', '.auth/**', 'tools/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Known-defect tests deliberately end with an assertion that is expected to fail.
      'playwright/no-conditional-in-test': 'off',
      // Page-object methods named expectSomething() contain the assertions, so they count as assertions in a test.
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['(^|\\.)expect[A-Z]\\w*$'] }],
    },
  },
]);
