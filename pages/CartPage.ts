import { Page, Locator } from '@playwright/test';
import { NavigablePage } from './NavigablePage';
import { HeaderComponent } from './components/HeaderComponent';
import { OrderReceiptPage } from './OrderReceiptPage';
import { parseCurrencyAmount } from '../utils/price-utils';

export class CartPage extends NavigablePage {
  protected readonly url = '/en/checkout';

  readonly header: HeaderComponent;
  readonly cartItems: Locator;
  readonly confirmOrderButton: Locator;
  readonly paymentDueRow: Locator;
  readonly orderSuccessNotice: Locator;
  readonly customerFirstNameInput: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartItems = page.locator('#box-checkout-cart ul.items li');
    this.confirmOrderButton = page.locator('button[name="confirm_order"]');
    // XPath: payment due amount — scoped to footer row, last td strong
    this.paymentDueRow = page.locator('xpath=//tr[contains(@class,"footer")]//td[last()]//strong');
    // Success page heading
    this.orderSuccessNotice = page.locator('h1');
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

  /** Parse dollar amount from payment due cell */
  parseTotal(text: string): number {
    return parseCurrencyAmount(text);
  }

  async getPaymentDueValue(): Promise<number> {
    const text = await this.getPaymentDueText();
    return this.parseTotal(text);
  }

  async confirmOrder(): Promise<void> {
    await this.confirmOrderButton.click();
    // After confirm, LiteCart redirects to /en/order_success
    await this.page.waitForURL(/order_success/, { timeout: 15_000 });
  }

  async isOrderConfirmed(): Promise<boolean> {
    return this.page.url().includes('order_success');
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

  /** Extracts the printable order copy URL from the order_success page */
  async getPrintableOrderUrl(): Promise<string> {
    const link = this.page.locator('a[href*="printable_order_copy"]');
    return (await link.getAttribute('href')) ?? '';
  }

  /**
   * Navigates directly to the printable order copy URL.
   * The link uses Fancybox (class="fancybox") — clicking it opens a modal overlay,
   * not a real browser navigation. We extract the href and navigate directly instead.
   */
  async openOrderReceipt(): Promise<OrderReceiptPage> {
    const url = await this.getPrintableOrderUrl();
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
    return new OrderReceiptPage(this.page);
  }
}
