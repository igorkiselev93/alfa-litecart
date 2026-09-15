import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';
import { LOCALE } from '../config/locale';
import { addToCartAndOrder } from '../helpers/order-helpers';

const PRODUCT_PATH = `/${LOCALE}/rubber-ducks-c-1/red-duck-p-3`;
const PRODUCT_NAME = 'Red Duck';
const QUANTITY = 3;

test.describe('TC-1: Regular product order (authorized user)', () => {
  test('should successfully place an order for 3 units of a regular-price product', async ({
    authedRegisteredPage,
    productPage,
    cartPage,
  }) => {
    await allure.epic('Orders');
    await allure.feature('TC-1: Regular product order');
    await allure.story('Authorized user orders regular product');

    await allure.step('Step 1: Register new user, verify login and empty cart', async () => {
      await expect(authedRegisteredPage.isLoggedIn()).toBeVisible();
      expect(await cartPage.header.getCartItemCount()).toBe(0);
    });

    let unitPrice = 0;
    await allure.step(`Step 2: Open product page "${PRODUCT_NAME}"`, async () => {
      await productPage.gotoProduct(PRODUCT_PATH);
      await expect(productPage.productTitle).toContainText(PRODUCT_NAME);
      expect(await productPage.isOnSale()).toBe(false);
      unitPrice = await productPage.getRegularPriceValue();
      expect(unitPrice).toBeGreaterThan(0);
    });

    // Steps 3–6: Add to cart, verify total, confirm order, verify receipt
    await addToCartAndOrder(productPage, cartPage, PRODUCT_NAME, unitPrice, QUANTITY);
  });
});
