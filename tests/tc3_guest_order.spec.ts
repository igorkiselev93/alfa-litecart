import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';
import { LOCALE } from '../config/locale';
import { addProductToCart } from '../helpers/order-helpers';

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

    // Step 1: Add first product to cart
    await allure.step(`Step 1: Open "${PRODUCT_1_NAME}" and add to cart`, async () => {
      await addProductToCart(productPage, PRODUCT_1_PATH, PRODUCT_1_NAME);
    });

    // Step 2: Add second product to cart
    await allure.step(`Step 2: Open "${PRODUCT_2_NAME}" and add to cart`, async () => {
      await addProductToCart(productPage, PRODUCT_2_PATH, PRODUCT_2_NAME);
    });

    await allure.step('Step 3: Verify both products in cart and order total', async () => {
      await cartPage.goto();
      await expect(cartPage.getOrderSummaryRow(PRODUCT_1_NAME)).toBeVisible();
      await expect(cartPage.getOrderSummaryRow(PRODUCT_2_NAME)).toBeVisible();
      const total = await cartPage.getPaymentDueValue();
      const totalText = await cartPage.getPaymentDueText();
      expect(totalText).toMatch(/[$€]\d+(\.\d{2})?/);
      expect(total).toBe(40);
    });

    await allure.step('Step 4: Verify customer fields are empty (guest mode)', async () => {
      const isGuest = await cartPage.isGuestCheckout();
      expect(isGuest).toBe(true);
    });

    await allure.step('Step 5: Return to home page and verify Recently Viewed block', async () => {
      await homePage.goto();
      const recentCount = await homePage.getRecentlyViewedCount();
      expect(recentCount).toBeGreaterThan(0);
      const product1InRecent = await homePage.isProductInRecentlyViewed(PRODUCT_1_NAME);
      const product2InRecent = await homePage.isProductInRecentlyViewed(PRODUCT_2_NAME);
      expect(product1InRecent || product2InRecent).toBe(true);
    });
  });
});
