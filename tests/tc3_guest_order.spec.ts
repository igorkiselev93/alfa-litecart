import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';

// Two different products for guest scenario
const PRODUCT_1_PATH = '/en/rubber-ducks-c-1/red-duck-p-3';
const PRODUCT_1_NAME = 'Red Duck';
const PRODUCT_2_PATH = '/en/rubber-ducks-c-1/blue-duck-p-4';
const PRODUCT_2_NAME = 'Blue Duck';

test.describe('TC-3: Заказ товара без авторизации (гость)', () => {
  test('должен добавить 2 разных товара, проверить корзину, поля гостя и блок "Recently Viewed"', async ({
    page,
    productPage,
    cartPage,
    homePage,
  }) => {
    await allure.epic('Orders');
    await allure.feature('TC-3: Guest checkout');
    await allure.story('Guest user adds products and checks recently viewed');

    // Step 1: Add first product to cart
    await allure.step(`Шаг 1: Открыть "${PRODUCT_1_NAME}" и добавить в корзину`, async () => {
      await productPage.goto(PRODUCT_1_PATH);
      await expect(productPage.productTitle).toContainText(PRODUCT_1_NAME);
      await productPage.selectSizeIfPresent();
      await productPage.setQuantity(1);
      await productPage.addToCart();
    });

    // Step 2: Add second product to cart
    await allure.step(`Шаг 2: Открыть "${PRODUCT_2_NAME}" и добавить в корзину`, async () => {
      await productPage.goto(PRODUCT_2_PATH);
      await expect(productPage.productTitle).toContainText(PRODUCT_2_NAME);
      await productPage.selectSizeIfPresent();
      await productPage.setQuantity(1);
      await productPage.addToCart();
    });

    // Step 3: Go to cart and validate both products present
    await allure.step('Шаг 3: Проверить оба товара в корзине и итоговую стоимость', async () => {
      await cartPage.goto();
      // Both products in order summary
      await expect(cartPage.getOrderSummaryRow(PRODUCT_1_NAME)).toBeVisible();
      await expect(cartPage.getOrderSummaryRow(PRODUCT_2_NAME)).toBeVisible();
      // Total should be $40 (2 × $20)
      const total = await cartPage.getPaymentDueValue();
      const totalText = await cartPage.getPaymentDueText();
      expect(totalText).toMatch(/\$\d+(\.\d{2})?/);
      expect(total).toBe(40);
    });

    // Step 4: Check guest customer fields are empty
    await allure.step('Шаг 4: Проверить, что поля покупателя пусты (гостевой режим)', async () => {
      const isGuest = await cartPage.isGuestCheckout();
      expect(isGuest).toBe(true);
    });

    // Step 5: Return to home and check Recently Viewed
    await allure.step('Шаг 5: Вернуться на главную и проверить блок "Recently Viewed"', async () => {
      await homePage.goto();
      // Recently Viewed should show the products we visited
      const recentCount = await homePage.getRecentlyViewedCount();
      expect(recentCount).toBeGreaterThan(0);
      // At least one of our products must appear
      const product1InRecent = await homePage.isProductInRecentlyViewed(PRODUCT_1_NAME);
      const product2InRecent = await homePage.isProductInRecentlyViewed(PRODUCT_2_NAME);
      expect(product1InRecent || product2InRecent).toBe(true);
    });
  });
});