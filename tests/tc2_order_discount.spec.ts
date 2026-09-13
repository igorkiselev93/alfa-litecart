import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';

const PRODUCT_PATH = '/en/rubber-ducks-c-1/subcategory-c-2/yellow-duck-p-1';
const PRODUCT_NAME = 'Yellow Duck';
const QUANTITY = 2;

test.describe('TC-2: Заказ одного товара со скидкой (авторизованный пользователь)', () => {
  test('должен успешно оформить заказ на 2 единицы товара по скидочной цене', async ({
    authedRegisteredPage,
    productPage,
    cartPage,
  }) => {
    await allure.epic('Orders');
    await allure.feature('TC-2: Discounted product order');
    await allure.story('Authorized user orders sale product');

    // Step 1: Register new user, verify login, and assert cart is empty (precondition)
    await allure.step('Шаг 1: Зарегистрировать нового пользователя, проверить авторизацию и пустую корзину', async () => {
      await expect(authedRegisteredPage.page.locator('#box-account a[href*="logout"]')).toBeVisible();
      // Precondition: cart must be empty — assertion belongs in the test, not in the Page Object
      expect(await cartPage.getHeaderCartItemCount()).toBe(0);
    });

    // Step 2: Navigate to sale product
    let salePrice = 0;
    await allure.step(`Шаг 2: Открыть страницу товара со скидкой "${PRODUCT_NAME}"`, async () => {
      await productPage.goto(PRODUCT_PATH);
      await expect(productPage.productTitle).toContainText(PRODUCT_NAME);
      expect(await productPage.isOnSale()).toBe(true);
      salePrice = await productPage.getSalePriceValue();
      expect(salePrice).toBeGreaterThan(0);
    });

  });
});