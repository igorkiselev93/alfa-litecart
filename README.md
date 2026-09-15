# LiteCart Playwright Test Suite

Automated E2E test suite for [litecart.stqa.ru](https://litecart.stqa.ru) built with Playwright + TypeScript.

## Stack

| Tool                                 | Version        | Purpose            |
| ------------------------------------ | -------------- | ------------------ |
| [Playwright](https://playwright.dev) | 1.63           | Browser automation |
| TypeScript                           | 5.7.3 (strict) | Type safety        |
| [Allure](https://allurereport.org)   | 3.x            | Test reporting     |
| [Faker.js](https://fakerjs.dev)      | 9.x            | Dynamic test data  |
| ESLint + eslint-plugin-playwright    | 9.x / 2.x      | Code quality       |
| Prettier                             | 3.x            | Code formatting    |

## Project Structure

```
├── config/
│   └── locale.ts                   # LOCALE env variable for multi-language support
├── fixtures/
│   └── page-fixtures.ts            # Playwright fixtures (pages + authedRegisteredPage)
├── helpers/
│   └── order-helpers.ts            # Shared step helpers for order tests
├── pages/                          # Page Object Model
│   ├── BasePage.ts                 # Abstract base: isLoggedIn, getTitle, waitForLogin…
│   ├── NavigablePage.ts            # Base for pages with a fixed URL (goto())
│   ├── TransientPage.ts            # Base for pages reached via navigation/redirect
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   ├── CartPage.ts
│   ├── CreateAccountPage.ts
│   ├── ProductPage.ts
│   ├── OrderSuccessPage.ts
│   ├── OrderReceiptPage.ts
│   └── components/
│       ├── BaseComponent.ts        # Abstract base with root Locator isolation
│       └── HeaderComponent.ts      # Header cart info and navigation
├── tests/
│   ├── tc1_order_regular.spec.ts
│   ├── tc2_order_discount.spec.ts
│   ├── tc3_guest_order.spec.ts
│   └── tc4_invalid_login.spec.ts
├── utils/
│   ├── price-utils.ts              # parseCurrencyAmount() — supports $ and €
│   └── element-utils.ts            # requireText() / requireAttribute() — fail-fast helpers
├── playwright.config.ts
├── tsconfig.json
└── eslint.config.js
```

## Test Cases

| ID   | Scenario                            | Auth         | Parallel |
| ---- | ----------------------------------- | ------------ | -------- |
| TC-1 | Order regular-price product (qty 3) | Fresh user   | ✅ Safe  |
| TC-2 | Order discounted product (qty 2)    | Fresh user   | ✅ Safe  |
| TC-3 | Guest checkout + Recently Viewed    | None (guest) | ✅ Safe  |
| TC-4 | Invalid login — negative test       | None         | ✅ Safe  |

TC-1 and TC-2 register a unique Faker user per run — isolated empty cart, safe for parallel execution.

## Prerequisites

- Node.js 20+
- Google Chrome installed (any standard installation path)
- Java 8+ (required by Allure CLI, bundled via `allure-commandline`)

## Setup

```bash
git clone <repo-url>
cd alfa-test
npm install
```

## Running Tests

```bash
# Run all tests (headless, 4 workers)
npm test

# Run with visible browser
npm run test:headed

# Run with Playwright UI mode (interactive)
npm run test:ui

# Clean allure-results and run tests
npm run test:clean
```

## Language Support

This suite targets the **English version** of litecart.stqa.ru only. All selectors, parsed text (cart counters, prices, order labels) and test data (product names, country/zone labels) are hardcoded for the English locale.

The `LOCALE` environment variable controls only the **URL prefix** (e.g. `/en/`). It is useful if the server moves the English store to a different path, but it does not translate any assertions or test data.

```powershell
# Default — English
npm test

# Different URL prefix (only if the target server serves English at that path)
$env:LOCALE="us"; npm test
```

## Allure Report

```bash
# Serve report from latest results (opens in browser)
npm run report

# Generate static report
npm run report:generate

# Open previously generated report
npm run report:open
```

`allure-commandline` is included as a dev dependency — no global install needed.

## Lint & Format

```bash
npm run lint
npm run format
```

## Architecture

### Page Object Hierarchy

```
BasePage (abstract)               — common: isLoggedIn, getTitle, waitForLoginConfirmation
  ├── NavigablePage (abstract)    — adds: abstract url, goto()
  │     ├── HomePage
  │     ├── LoginPage
  │     ├── CartPage
  │     └── CreateAccountPage
  └── TransientPage (abstract)    — no url, no goto() — reached via redirect or action
        ├── ProductPage           — gotoProduct(path)
        ├── OrderSuccessPage      — returned by CartPage.confirmOrder()
        └── OrderReceiptPage      — returned by OrderSuccessPage.openOrderReceipt()

BaseComponent (abstract)          — root: Locator (scoped DOM area)
  └── HeaderComponent             — cart count, total, navigation
```

### Key Design Decisions

- **Page Object Model** — locators and actions fully encapsulated; tests never access `page` directly
- **Component isolation** — `HeaderComponent` is scoped to `#header` root locator, reused across `ProductPage` and `CartPage`
- **Fail-fast helpers** — `requireText()` and `requireAttribute()` throw descriptive errors instead of returning empty strings
- **Network-based waiting** — `addToCart()` uses `page.waitForResponse()` on `/ajax/cart.json` POST instead of polling or hardcoded waits
- **Shared helpers** — `addToCartAndOrder()` and `addProductToCart()` in `helpers/order-helpers.ts` eliminate step duplication between TC-1, TC-2 and TC-3
- **Currency-agnostic parsing** — `parseCurrencyAmount()` handles both `$` and `€`
- **No `expect` in Page Objects** — enforced via ESLint `no-restricted-imports` rule
- **Order receipt** — navigated to directly via extracted `href` to avoid Fancybox iframe and `window.print()` dialog
