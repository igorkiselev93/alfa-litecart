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
    await allure.step(
      'Шаг 1: Зарегистрировать нового пользователя, проверить авторизацию и пустую корзину',
      async () => {
        await expect(authedRegisteredPage.isLoggedIn()).toBeVisible();
        // Precondition: cart must be empty — assertion belongs in the test, not in the Page Object
        expect(await cartPage.header.getCartItemCount()).toBe(0);
      },
    );

    // Step 2: Navigate to product and get price
    let unitPrice = 0;
    await allure.step(`Шаг 2: Открыть страницу товара "${PRODUCT_NAME}"`, async () => {
      await productPage.gotoProduct(PRODUCT_PATH);
      await expect(productPage.productTitle).toContainText(PRODUCT_NAME);
      expect(await productPage.isOnSale()).toBe(false);
      unitPrice = await productPage.getRegularPriceValue();
      expect(unitPrice).toBeGreaterThan(0);
    });

    // Step 3: Set quantity and add to cart
    await allure.step(`Шаг 3: Установить количество ${QUANTITY} и добавить в корзину`, async () => {
      await productPage.selectSizeIfPresent();
      await productPage.setQuantity(QUANTITY);
      await productPage.addToCart();
      const cartCount = await productPage.header.getCartItemCount();
      expect(cartCount).toBe(QUANTITY);
    });

    // Step 4: Go to cart and verify total
    await allure.step('Шаг 4: Перейти в корзину и проверить итоговую стоимость', async () => {
      await cartPage.goto();
      const paymentDue = await cartPage.getPaymentDueValue();
      const expectedTotal = unitPrice * QUANTITY;
      // RegEx validation: total must match pattern "$XX.XX" or "€XX.XX"
      const paymentText = await cartPage.getPaymentDueText();
      expect(paymentText).toMatch(/[$€]\d+(\.\d{2})?/);
      expect(paymentDue).toBe(expectedTotal);
    });

    // Step 5: Confirm order
    await allure.step('Шаг 5: Подтвердить заказ', async () => {
      await cartPage.confirmOrder();
      expect(await cartPage.isOrderConfirmed()).toBe(true);
      await expect(cartPage.orderSuccessNotice).toContainText('successfully completed', {
        ignoreCase: true,
      });
    });

    // Step 6: Open printable receipt and verify order details
    await allure.step('Шаг 6: Открыть чек и проверить корректность заказа', async () => {
      const receipt = await cartPage.openOrderReceipt();

      // Order number must be present
      const orderNum = await receipt.getOrderNumber();
      expect(orderNum).toMatch(/order\s*#\d+/i);

      // Verify line item
      const items = await receipt.getOrderItems();
      expect(items).toHaveLength(1);
      expect(items[0].item).toContain(PRODUCT_NAME);
      expect(items[0].qty).toBe(QUANTITY);
      expect(items[0].unitPrice).toBe(unitPrice);
      // Sum = qty × unit price
      expect(items[0].sum).toBe(unitPrice * QUANTITY);

      // Grand Total via RegEx pattern and value check
      const grandTotalText = await receipt.getGrandTotalText();
      expect(grandTotalText).toMatch(/[$€]\d+\.\d{2}/);
      expect(await receipt.getGrandTotalValue()).toBe(unitPrice * QUANTITY);
    });
  });
});
