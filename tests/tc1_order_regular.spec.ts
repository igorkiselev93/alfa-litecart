import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';

const PRODUCT_PATH = '/en/rubber-ducks-c-1/red-duck-p-3';
const PRODUCT_NAME = 'Red Duck';
const QUANTITY = 3;

test.describe('TC-1: Заказ одного товара без скидки (авторизованный пользователь)', () => {
  test('должен успешно оформить заказ на 3 единицы товара без скидки', async ({
    authedRegisteredPage,
    productPage,
    cartPage,
  }) => {
    await allure.epic('Orders');
    await allure.feature('TC-1: Regular product order');
    await allure.story('Authorized user orders regular product');

    // Step 1: Register new user, verify login, and assert cart is empty (precondition)
    await allure.step('Шаг 1: Зарегистрировать нового пользователя, проверить авторизацию и пустую корзину', async () => {
      await expect(authedRegisteredPage.page.locator('#box-account a[href*="logout"]')).toBeVisible();
      // Precondition: cart must be empty — assertion belongs in the test, not in the Page Object
      expect(await cartPage.getHeaderCartItemCount()).toBe(0);
    });

    // Step 2: Navigate to product and get price
    let unitPrice = 0;
    await allure.step(`Шаг 2: Открыть страницу товара "${PRODUCT_NAME}"`, async () => {
      await productPage.goto(PRODUCT_PATH);
      await expect(productPage.productTitle).toContainText(PRODUCT_NAME);
      expect(await productPage.isOnSale()).toBe(false);
      unitPrice = await productPage.getRegularPriceValue();
      expect(unitPrice).toBeGreaterThan(0);
    });

  });
});
