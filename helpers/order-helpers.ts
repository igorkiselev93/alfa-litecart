import { expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { OrderReceiptPage } from '../pages/OrderReceiptPage';
import { calcTotal } from '../utils/price-utils';

export interface OrderResult {
  orderSuccess: OrderSuccessPage;
  receipt: OrderReceiptPage;
}

/**
 * Navigates to a product page, verifies the title, and adds it to the cart.
 */
export async function addProductToCart(
  productPage: ProductPage,
  productPath: string,
  productName: string,
  quantity = 1,
): Promise<void> {
  await productPage.gotoProduct(productPath);
  await expect(productPage.productTitle).toContainText(productName);
  await productPage.selectSizeIfPresent();
  await productPage.setQuantity(quantity);
  await productPage.addToCart(quantity);
}

/**
 * Shared steps 3–6 for authorized order tests (TC-1 and TC-2).
 * Adds product to cart, verifies total, confirms order, opens receipt.
 */
export async function addToCartAndOrder(
  productPage: ProductPage,
  cartPage: CartPage,
  productName: string,
  unitPrice: number,
  quantity: number,
): Promise<OrderResult> {
  await allure.step(`Step 3: Set quantity to ${quantity} and add to cart`, async () => {
    await productPage.selectSizeIfPresent();
    await productPage.setQuantity(quantity);
    await productPage.addToCart(quantity);
    const cartCount = await productPage.header.getCartItemCount();
    expect(cartCount).toBe(quantity);
  });

  await allure.step('Step 4: Navigate to cart and verify order total', async () => {
    await cartPage.goto();
    const paymentDue = await cartPage.getPaymentDueValue();
    const expectedTotal = calcTotal(unitPrice, quantity);
    const paymentText = await cartPage.getPaymentDueText();
    expect(paymentText).toMatch(/[$€]\d+(\.\d{2})?/);
    expect(paymentDue).toBe(expectedTotal);
  });

  let orderSuccess!: OrderSuccessPage;
  await allure.step('Step 5: Confirm order', async () => {
    orderSuccess = await cartPage.confirmOrder();
    expect(await orderSuccess.isOrderConfirmed()).toBe(true);
    await expect(orderSuccess.successHeading).toContainText('successfully completed', {
      ignoreCase: true,
    });
  });

  let receipt!: OrderReceiptPage;
  await allure.step('Step 6: Open printable receipt and verify order details', async () => {
    receipt = await orderSuccess.openOrderReceipt();

    const orderNum = await receipt.getOrderNumber();
    expect(orderNum).toMatch(/order\s*#\d+/i);

    const items = await receipt.getOrderItems();
    expect(items).toHaveLength(1);
    expect(items[0].item).toContain(productName);
    expect(items[0].qty).toBe(quantity);
    expect(items[0].unitPrice).toBe(unitPrice);
    expect(items[0].sum).toBe(calcTotal(unitPrice, quantity));

    const grandTotalText = await receipt.getGrandTotalText();
    expect(grandTotalText).toMatch(/[$€]\d+\.\d{2}/);
    expect(await receipt.getGrandTotalValue()).toBe(calcTotal(unitPrice, quantity));
  });

  return { orderSuccess, receipt };
}
