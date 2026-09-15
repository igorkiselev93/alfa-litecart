import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';
import { LOCALE } from '../config/locale';
import { addToCartAndOrder } from '../helpers/order-helpers';

const PRODUCT_PATH = `/${LOCALE}/rubber-ducks-c-1/subcategory-c-2/yellow-duck-p-1`;
const PRODUCT_NAME = 'Yellow Duck';
const QUANTITY = 2;

test.describe('TC-2: Discounted product order (authorized user)', () => {
  test('should successfully place an order for 2 units at a sale price', async ({
    authedRegisteredPage,
    productPage,
    cartPage,
  }) => {
    await allure.epic('Orders');
    await allure.feature('TC-2: Discounted product order');
    await allure.story('Authorized user orders sale product');

    await allure.step('Step 1: Register new user, verify login and empty cart', async () => {
      await expect(authedRegisteredPage.isLoggedIn()).toBeVisible();
      expect(await cartPage.header.getCartItemCount()).toBe(0);
    });

    // Step 2: Navigate to sale product, verify discount and get sale price
    let salePrice = 0;
    await allure.step(
      `Step 2: Open sale product page "${PRODUCT_NAME}" and verify discount`,
      async () => {
        await productPage.gotoProduct(PRODUCT_PATH);
        await expect(productPage.productTitle).toContainText(PRODUCT_NAME);
        expect(await productPage.isOnSale()).toBe(true);

        const originalPrice = await productPage.getOriginalPriceValue();
        salePrice = await productPage.getSalePriceValue();

        expect(originalPrice).toBeGreaterThan(0);
        expect(salePrice).toBeGreaterThan(0);
        // Core assertion: sale price must actually be lower than the original
        expect(salePrice).toBeLessThan(originalPrice);
      },
    );

    // Steps 3–6: Add to cart, verify total, confirm order, verify receipt
    await addToCartAndOrder(productPage, cartPage, PRODUCT_NAME, salePrice, QUANTITY);
  });
});
