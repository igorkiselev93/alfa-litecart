import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';

const PRODUCT_PATH = '/en/rubber-ducks-c-1/red-duck-p-3';
const PRODUCT_NAME = 'Red Duck';
const QUANTITY = 3;

test.describe('TC-1: Заказ одного товара без скидки (авторизованный пользователь)', () => {
  test('должен успешно оформить заказ на 3 единицы товара без скидки', async ({
    authedPage,
    productPage,
    cartPage,
  }) => {
    await allure.epic('Orders');
    await allure.feature('TC-1: Regular product order');
    await allure.story('Authorized user orders regular product');

    // Step 1: Verify login
    await allure.step('Шаг 1: Проверить авторизацию', async () => {
      await expect(authedPage.page.locator('a[href*="logout"]')).toBeVisible();
    });

    // Step 2: Clear cart before test
    await allure.step('Шаг 2: Очистить корзину', async () => {
      await cartPage.goto();
      const removeButtons = cartPage.page.locator('button:has-text("Remove")');
      let count = await removeButtons.count();
      while (count > 0) {
        await removeButtons.first().click();
        await cartPage.page.waitForLoadState('domcontentloaded');
        count = await cartPage.page.locator('button:has-text("Remove")').count();
      }
    });
  });
});
