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

## Prerequisites

- Node.js 20+
- Google Chrome installed (any standard installation path)
- Java 8+ (required by Allure CLI, bundled via `allure-commandline`)

## Setup

```bash
git clone <repo-url>
cd alfa-litecard
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
npm run format:check   # non-mutating check (use in CI)
npm run format         # auto-fix formatting
```

## Architecture

### Page Object Hierarchy

```
BasePage (abstract)               — getCurrentUrl, getTitle
  ├── StaticPage (abstract)       — abstract url, goto()       — fixed URL, navigate directly
  │     ├── HomePage              — header, sideMenu
  │     ├── LoginPage
  │     ├── CartPage              — header
  │     └── CreateAccountPage
  ├── DynamicPage (abstract)      — goto(path: string)         — parametric URL
  │     └── ProductPage           — header; goto('/en/rubber-ducks-c-1/...')
  └── TransientPage (abstract)    — no url, no goto()          — reached via redirect only
        ├── OrderSuccessPage      — returned by CartPage.confirmOrder()
        └── OrderReceiptPage      — returned by OrderSuccessPage.openOrderReceipt()

BaseComponent (abstract)          — root: Locator (scoped DOM area)
  ├── HeaderComponent             — #header → cart count, waitForCartCount()
  └── SideMenuComponent           — aside#navigation → isLoggedIn(), recentlyViewed methods
```

### Key Design Decisions

- **Page Object Model** — locators and actions fully encapsulated; tests never access `page` directly
- **Three-tier page hierarchy** — `StaticPage` (fixed URL), `DynamicPage` (parametric URL), `TransientPage` (no URL — redirect only)
- **Component isolation** — `HeaderComponent` scoped to `#header`, `SideMenuComponent` scoped to `aside#navigation`; added only to pages where the element exists in DOM
- **Shared helpers** — `addToCartAndOrder()` and `addProductToCart()` in `helpers/order-helpers.ts` eliminate step duplication between TC-1, TC-2 and TC-3
- **No `expect` in Page Objects** — enforced via ESLint `no-restricted-imports` rule
- **Order receipt** — navigated to directly via extracted `href` to avoid Fancybox iframe and `window.print()` dialog
