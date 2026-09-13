import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { OrderReceiptPage } from './OrderReceiptPage';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly confirmOrderButton: Locator;
  readonly paymentDueRow: Locator;
  readonly orderSuccessNotice: Locator;
  readonly customerFirstNameInput: Locator;
  /** Cart item count readable from any page via header */
  readonly headerCartCount: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('#box-checkout-cart ul.items li');
    this.confirmOrderButton = page.locator('button[name="confirm_order"]');
    // XPath: payment due amount — scoped to footer row, last td strong
    this.paymentDueRow = page.locator('xpath=//tr[contains(@class,"footer")]//td[last()]//strong');
    // Success page heading
    this.orderSuccessNotice = page.locator('h1');
    // Guest checkout fields
    this.customerFirstNameInput = page.locator('input[name="firstname"]');
    // Header cart link — readable from any page, not just /checkout
    this.headerCartCount = page.locator('#cart a.content');
  }

  async goto(): Promise<void> {
    await super.goto('/en/checkout');
  }

  /** Number of items in cart — only valid on /en/checkout page */
  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  /**
   * Number of items in cart parsed from the header link.
   * Works on any page, no navigation required.
   */
  async getHeaderCartItemCount(): Promise<number> {
    const text = (await this.headerCartCount.textContent()) ?? '';
    const match = text.match(/(\d+)\s+item/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getPaymentDueText(): Promise<string> {
    return (await this.paymentDueRow.textContent()) ?? '';
  }

  /** Parse dollar amount from payment due cell */
  parseTotal(text: string): number {
    const match = text.match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
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
