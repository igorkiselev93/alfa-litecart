const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const playwright = require('eslint-plugin-playwright');
const { defineConfig } = require('@eslint/config-helpers');

module.exports = defineConfig([
  // ── Base JS + TS recommended rules ──────────────────────────────────────────
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // ── Type-aware linting (requires tsconfig.json) ──────────────────────────────
  // Enables rules that need full type information (e.g. no-floating-promises)
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },

  // ── TypeScript strict rules ──────────────────────────────────────────────────
  {
    rules: {
      // Prevent unused variables slipping through (params starting with _ are exempt)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Disallow `any` – use `unknown` or proper types instead
      '@typescript-eslint/no-explicit-any': 'error',

      // Enforce async functions return typed promises
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],

      // Prefer `const` over `let` where variable is never reassigned
      'prefer-const': 'error',

      // Disallow console.log in tests/pages (use allure steps or reporter)
      'no-console': 'warn',

      // Enforce consistent use of === over ==
      eqeqeq: ['error', 'always'],

      // Every floating promise must be awaited or explicitly void-ed
      '@typescript-eslint/no-floating-promises': 'error',

      // Disallow non-null assertion operator `!` – use proper checks
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },

  // ── Playwright-specific rules (applied to test files only) ───────────────────
  {
    files: ['tests/**/*.ts', '**/*.spec.ts', '**/*.test.ts'],
    plugins: { playwright },
    rules: {
      // Core playwright recommended rules
      ...playwright.configs['flat/recommended'].rules,

      // Disallow page.pause() left in committed code
      'playwright/no-page-pause': 'error',

      // Disallow hard-coded waits (use auto-waiting or expect with timeout)
      'playwright/no-wait-for-timeout': 'error',

      // Enforce using locators instead of deprecated ElementHandle ($ / $$)
      'playwright/no-element-handle': 'error',

      // Disallow eval inside page.evaluate
      'playwright/no-eval': 'error',

      // Disallow skipped tests without a reason
      'playwright/no-skipped-test': 'warn',

      // Disallow focused tests (.only) accidentally committed
      'playwright/no-focused-test': 'error',

      // Prefer web-first assertions:
      //   ✅ expect(locator).toBeVisible()
      //   ❌ expect(await locator.isVisible()).toBe(true)
      'playwright/prefer-web-first-assertions': 'error',

      // Prefer strict equality in expect()
      'playwright/prefer-strict-equal': 'warn',

      // Prefer expect(locator).toHaveCount(n) over counting manually
      'playwright/prefer-to-have-count': 'warn',

      // Prefer toHaveLength for arrays
      'playwright/prefer-to-have-length': 'warn',

      // Suggest locator over page.$$ / page.$
      'playwright/prefer-locator': 'warn',

      // No useless `await` on non-promise values
      'playwright/no-useless-await': 'warn',

      // Limit describe nesting depth
      'playwright/max-nested-describe': ['warn', { max: 2 }],

      // Warn on conditionals inside tests (branching = flakiness risk)
      'playwright/no-conditional-in-test': 'warn',
    },
  },

  // ── Page Object files – stricter rules ───────────────────────────────────────
  {
    files: ['pages/**/*.ts'],
    rules: {
      // PO methods must declare return types explicitly
      '@typescript-eslint/explicit-function-return-type': 'error',

      // Page Objects must NOT contain test assertions
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              importNames: ['expect'],
              message:
                'Do not use expect() in Page Objects. Assertions belong in test files.',
            },
          ],
        },
      ],
    },
  },

  // ── Fixture files – PO-level strictness, but expect re-export is allowed ─────
  {
    files: ['fixtures/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },

  // ── Files and directories to ignore ──────────────────────────────────────────
  {
    ignores: [
      'node_modules/**',
      'allure-report/**',
      'allure-results/**',
      'test-results/**',
      'playwright-report/**',
      'dist/**',
      // Config files are not part of the TS project — exclude from type-aware parsing
      'eslint.config.js',
    ],
  },
]);
