import { expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { OrderReceiptPage, OrderLineItem } from '../pages/OrderReceiptPage';
import { calcTotal } from '../utils/price-utils';

export interface OrderResult {
  orderSuccessPage: OrderSuccessPage;
  orderReceiptPage: OrderReceiptPage;
}

/**
 * Navigates to product page and adds it to the cart,
 * and returns the unit price.
 */
export async function addProductToCart(
  productPage: ProductPage,
  productPath: string,
  productName: string,
  quantity = 1,
): Promise<number> {
  await productPage.goto(productPath);
  await expect(productPage.productTitle).toContainText(productName);
  const unitPrice = await productPage.getRegularPriceValue();
  await productPage.selectSizeIfPresent();
  await productPage.setQuantity(quantity);
  await productPage.addToCart(quantity);
  return unitPrice;
}

/**
 * Adds product to cart, verifies total, confirms order, opens receipt.
 */
export async function addToCartAndOrder(
  productPage: ProductPage,
  cartPage: CartPage,
  productName: string,
  unitPrice: number,
  quantity: number,
): Promise<OrderResult> {
  await allure.step(`Step 2: Set quantity to ${quantity} and add to cart`, async () => {
    await productPage.selectSizeIfPresent();
    await productPage.setQuantity(quantity);
    await productPage.addToCart(quantity);
    const cartCount = await productPage.header.getCartItemCount();
    expect(cartCount).toBe(quantity);
  });

  await allure.step('Step 3: Navigate to cart and verify order total', async () => {
    await cartPage.goto();
    const paymentDue = await cartPage.getPaymentDueValue();
    const expectedTotal = calcTotal(unitPrice, quantity);
    expect(paymentDue).toBe(expectedTotal);
  });

  const orderSuccessPage = await allure.step('Step 4: Confirm order', async () => {
    const success: OrderSuccessPage = await cartPage.confirmOrder();
    expect(await success.isOrderConfirmed()).toBe(true);
    await expect(success.successHeading).toContainText('successfully completed', {
      ignoreCase: true,
    });
    return success;
  });

  const orderReceiptPage = await allure.step(
    'Step 5: Open printable receipt and verify order details',
    async () => {
      const receipt: OrderReceiptPage = await orderSuccessPage.openOrderReceipt();

      const orderNum = await receipt.getOrderNumber();
      expect(orderNum).toMatch(/order\s*#\d+/i);

      const items: OrderLineItem[] = await receipt.getOrderItems();
      expect(items).toHaveLength(1);
      expect(items[0].item).toContain(productName);
      expect(items[0].qty).toBe(quantity);
      expect(items[0].unitPrice).toBe(unitPrice);
      expect(items[0].sum).toBe(calcTotal(unitPrice, quantity));

      expect(await receipt.getGrandTotalValue()).toBe(calcTotal(unitPrice, quantity));

      return receipt;
    },
  );

  return { orderSuccessPage, orderReceiptPage };
}
