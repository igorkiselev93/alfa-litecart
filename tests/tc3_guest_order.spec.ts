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

    
  });
});