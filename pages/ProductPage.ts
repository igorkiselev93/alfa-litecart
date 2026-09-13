import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

export class ProductPage extends BasePage {
  // URL is dynamic (per-product path), navigation handled by goto(productPath)
  protected readonly url = '';

  readonly header: HeaderComponent;
  readonly productTitle: Locator;
  readonly regularPrice: Locator;
  readonly salePrice: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly sizeSelect: Locator;
  readonly originalPriceStrikethrough: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.productTitle = page.locator('h1[itemprop="name"]');
    // Price wrapper scoped to the product box (not related-products widgets)
    this.regularPrice = page.locator('#box-product .price-wrapper');
    this.salePrice = page.locator('#box-product .price-wrapper strong');
    // XPath: original strikethrough price, scoped to product box
    this.originalPriceStrikethrough = page.locator(
      'xpath=//div[@id="box-product"]//div[contains(@class,"price-wrapper")]//s',
    );
    this.quantityInput = page.locator('input[name="quantity"]');
    this.addToCartButton = page.locator('button[name="add_cart_product"]');
    // Size option select (some products require it)
    this.sizeSelect = page.locator('select[name="options[Size]"]');
  }

  async gotoProduct(productPath: string): Promise<void> {
    await this.page.goto(productPath);
  }

  async getTitle(): Promise<string> {
    return (await this.productTitle.textContent()) ?? '';
  }

  async getPriceText(): Promise<string> {
    return (await this.regularPrice.textContent()) ?? '';
  }

  /** Parse price number from text like "$20" or "$18" */
  parsePriceValue(priceText: string): number {
    const match = priceText.match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async isOnSale(): Promise<boolean> {
    return this.originalPriceStrikethrough.isVisible();
  }

  async getSalePriceValue(): Promise<number> {
    const text = (await this.salePrice.textContent()) ?? '';
    return this.parsePriceValue(text);
  }

  async getRegularPriceValue(): Promise<number> {
    const text = await this.getPriceText();
    return this.parsePriceValue(text);
  }

  /** Select size if the product has a required size dropdown */
  async selectSizeIfPresent(size = 'Small'): Promise<void> {
    const isVisible = await this.sizeSelect.isVisible().catch(() => false);
    if (isVisible) {
      await this.sizeSelect.selectOption({ value: size });
    }
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(): Promise<void> {
    const countBefore = await this.header.getCartItemCount();
    await this.addToCartButton.click();
    // Wait for AJAX cart update: item count must increase
    await this.page.waitForFunction(
      (prevCount) => {
        const cartEl = document.querySelector('#cart a.content');
        if (!cartEl || !cartEl.textContent) return false;
        const m = cartEl.textContent.match(/(\d+)\s+item/);
        return m ? parseInt(m[1], 10) > prevCount : false;
      },
      countBefore,
      { timeout: 15_000 },
    );
  }
}
