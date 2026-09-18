import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';
import { LOCALE } from '../config/locale';
import { addToCartAndOrder } from '../helpers/order-helpers';

const PRODUCT_PATH = `/${LOCALE}/rubber-ducks-c-1/subcategory-c-2/yellow-duck-p-1`;
const PRODUCT_NAME = 'Yellow Duck';
const QUANTITY = 2;

test.describe('TC-2: Discounted product order (authorized user)', () => {
  test('should successfully place an order for 2 units at a sale price', async ({
    loggedInHomePage,
    productPage,
    cartPage,
  }) => {
    await allure.epic('Orders');
    await allure.feature('TC-2: Discounted product order');
    await allure.story('Authorized user orders sale product');

    await allure.step('Precondition: Register new user, verify login and empty cart', async () => {
      await expect(loggedInHomePage.sideMenu.isLoggedIn()).toBeVisible();
      await expect(cartPage.header.cartLinkWithCount(0)).toBeVisible();
    });

    // Step 1: Navigate to sale product, verify discount and get sale price
    const salePrice = await allure.step(
      `Step 1: Open sale product page "${PRODUCT_NAME}", verify discount and set size`,
      async () => {
        await productPage.goto(PRODUCT_PATH);
        await expect(productPage.productTitle).toContainText(PRODUCT_NAME);
        await expect(productPage.originalPriceStrikethrough).toBeVisible();

        const originalPrice = await productPage.getOriginalPriceValue();
        const price = await productPage.getSalePriceValue();

        expect(originalPrice).toBeGreaterThan(0);
        expect(price).toBeGreaterThan(0);
        // Core assertion: sale price must actually be lower than the original
        expect(price).toBeLessThan(originalPrice);
        // set product size
        await productPage.selectSize('Small');
        return price;
      },
    );

    // Steps 2–5: Add to cart, verify total, confirm order, verify receipt
    await addToCartAndOrder(productPage, cartPage, PRODUCT_NAME, salePrice, QUANTITY);
  });
});
