import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { LOCALE } from '../config/locale';

const PRODUCT_PATH = `/${LOCALE}/rubber-ducks-c-1/subcategory-c-2/yellow-duck-p-1`;
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
    await allure.step(
      'Шаг 1: Зарегистрировать нового пользователя, проверить авторизацию и пустую корзину',
      async () => {
        await expect(authedRegisteredPage.isLoggedIn()).toBeVisible();
        // Precondition: cart must be empty — assertion belongs in the test, not in the Page Object
        expect(await cartPage.header.getCartItemCount()).toBe(0);
      },
    );

    // Step 2: Navigate to sale product
    let salePrice = 0;
    await allure.step(`Шаг 2: Открыть страницу товара со скидкой "${PRODUCT_NAME}"`, async () => {
      await productPage.gotoProduct(PRODUCT_PATH);
      await expect(productPage.productTitle).toContainText(PRODUCT_NAME);
      expect(await productPage.isOnSale()).toBe(true);
      salePrice = await productPage.getSalePriceValue();
      expect(salePrice).toBeGreaterThan(0);
    });

    // Step 3: Set quantity and add to cart
    await allure.step(`Шаг 3: Установить количество ${QUANTITY} и добавить в корзину`, async () => {
      await productPage.selectSizeIfPresent();
      await productPage.setQuantity(QUANTITY);
      await productPage.addToCart();
      const cartCount = await productPage.header.getCartItemCount();
      expect(cartCount).toBe(QUANTITY);
    });

    // Step 4: Go to cart and verify discounted total
    await allure.step('Шаг 4: Перейти в корзину и проверить итог по скидочной цене', async () => {
      await cartPage.goto();
      const paymentDue = await cartPage.getPaymentDueValue();
      const expectedTotal = salePrice * QUANTITY;
      const paymentText = await cartPage.getPaymentDueText();
      // RegEx: must be currency amount
      expect(paymentText).toMatch(/[$€]\d+(\.\d{2})?/);
      expect(paymentDue).toBe(expectedTotal);
    });

    // Step 5: Confirm order
    let orderSuccess: OrderSuccessPage;
    await allure.step('Шаг 5: Подтвердить заказ', async () => {
      orderSuccess = await cartPage.confirmOrder();
      expect(await orderSuccess.isOrderConfirmed()).toBe(true);
      await expect(orderSuccess.successHeading).toContainText('successfully completed', {
        ignoreCase: true,
      });
    });

    // Step 6: Open printable receipt and verify order details
    await allure.step(
      'Шаг 6: Открыть чек и проверить корректность заказа (скидочная цена)',
      async () => {
        const receipt = await orderSuccess.openOrderReceipt();

        // Order number must be present
        const orderNum = await receipt.getOrderNumber();
        expect(orderNum).toMatch(/order\s*#\d+/i);

        // Verify line item uses sale price
        const items = await receipt.getOrderItems();
        expect(items).toHaveLength(1);
        expect(items[0].item).toContain(PRODUCT_NAME);
        expect(items[0].qty).toBe(QUANTITY);
        expect(items[0].unitPrice).toBe(salePrice);
        // Sum = qty × sale price
        expect(items[0].sum).toBe(salePrice * QUANTITY);

        // Grand Total via RegEx and value check
        const grandTotalText = await receipt.getGrandTotalText();
        expect(grandTotalText).toMatch(/[$€]\d+\.\d{2}/);
        expect(await receipt.getGrandTotalValue()).toBe(salePrice * QUANTITY);
      },
    );
  });
});
