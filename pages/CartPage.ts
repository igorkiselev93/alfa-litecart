import { Page, Locator } from '@playwright/test';
import { NavigablePage } from './NavigablePage';
import { HeaderComponent } from './components/HeaderComponent';
import { OrderSuccessPage } from './OrderSuccessPage';
import { parseCurrencyAmount } from '../utils/price-utils';
import { LOCALE } from '../config/locale';

export class CartPage extends NavigablePage {
  protected readonly url = `/${LOCALE}/checkout`;

  readonly header: HeaderComponent;
  readonly cartItems: Locator;
  readonly confirmOrderButton: Locator;
  readonly paymentDueRow: Locator;
  readonly customerFirstNameInput: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartItems = page.locator('#box-checkout-cart ul.items li');
    this.confirmOrderButton = page.locator('button[name="confirm_order"]');
    // XPath: payment due amount — scoped to footer row, last td strong
    this.paymentDueRow = page.locator('xpath=//tr[contains(@class,"footer")]//td[last()]//strong');
    // Guest checkout fields
    this.customerFirstNameInput = page.locator('input[name="firstname"]');
  }

  /** Number of items in cart — only valid on /en/checkout page */
  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getPaymentDueText(): Promise<string> {
    return (await this.paymentDueRow.textContent()) ?? '';
  }

  async getPaymentDueValue(): Promise<number> {
    const text = await this.getPaymentDueText();
    return parseCurrencyAmount(text);
  }

  /** Confirms the order and returns OrderSuccessPage after redirect */
  async confirmOrder(): Promise<OrderSuccessPage> {
    await this.confirmOrderButton.click();
    // After confirm, LiteCart redirects to /en/order_success
    await this.page.waitForURL(/order_success/, { timeout: 15_000 });
    return new OrderSuccessPage(this.page);
  }

  /** Check if a product name appears in the order summary table */
  getOrderSummaryRow(productName: string): Locator {
    return this.page.locator(
      `xpath=//table[.//th[text()="Product"]]//td[contains(text(),"${productName}")]`,
    );
  }

  /** Check guest checkout: first name field should be empty */
  async isGuestCheckout(): Promise<boolean> {
    const value = await this.customerFirstNameInput.inputValue();
    return value.trim() === '';
  }
}
