import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';
import { LOCALE } from '../config/locale';
import { addProductToCart } from '../helpers/order-helpers';
import { sumPrices } from '../utils/price-utils';

const PRODUCT_1_PATH = `/${LOCALE}/rubber-ducks-c-1/red-duck-p-3`;
const PRODUCT_1_NAME = 'Red Duck';
const PRODUCT_2_PATH = `/${LOCALE}/rubber-ducks-c-1/blue-duck-p-4`;
const PRODUCT_2_NAME = 'Blue Duck';

test.describe('TC-3: Guest checkout', () => {
  test('should add 2 products, verify cart, guest fields and Recently Viewed block', async ({
    productPage,
    cartPage,
    homePage,
  }) => {
    await allure.epic('Orders');
    await allure.feature('TC-3: Guest checkout');
    await allure.story('Guest user adds products and checks recently viewed');

    await allure.step('Precondition: Cart is empty', async () => {
      await homePage.goto();
      expect(await homePage.header.getCartItemCount()).toBe(0);
    });

    // Step 1: Add first product to cart
    const price1 = await allure.step(
      `Step 1: Open "${PRODUCT_1_NAME}" and add to cart`,
      () => addProductToCart(productPage, PRODUCT_1_PATH, PRODUCT_1_NAME),
    );

    // Step 2: Add second product to cart
    const price2 = await allure.step(
      `Step 2: Open "${PRODUCT_2_NAME}" and add to cart`,
      () => addProductToCart(productPage, PRODUCT_2_PATH, PRODUCT_2_NAME),
    );

    await allure.step('Step 3: Verify both products in cart and order total', async () => {
      await cartPage.goto();
      await expect(cartPage.getOrderSummaryRow(PRODUCT_1_NAME)).toBeVisible();
      await expect(cartPage.getOrderSummaryRow(PRODUCT_2_NAME)).toBeVisible();
      const total = await cartPage.getPaymentDueValue();
      // Expected total derived from actual product prices — not a hardcoded magic number
      expect(total).toBe(sumPrices(price1, price2));
    });

    await allure.step(
      'Step 4: Verify first name field is empty (not pre-filled for guest)',
      async () => {
        expect(await cartPage.isFirstNameEmpty()).toBe(true);
      },
    );

    await allure.step('Step 5: Return to home page and verify Recently Viewed block', async () => {
      await homePage.goto();
      const recentCount = await homePage.sideMenu.getRecentlyViewedCount();
      expect(recentCount).toBeGreaterThan(0);
      // Both visited products must appear in the Recently Viewed block
      await expect(homePage.sideMenu.getRecentlyViewedItem(PRODUCT_1_NAME)).toBeVisible();
      await expect(homePage.sideMenu.getRecentlyViewedItem(PRODUCT_2_NAME)).toBeVisible();
    });
  });
});
