import { Page, Locator } from '@playwright/test';
import { TransientPage } from './TransientPage';
import { HeaderComponent } from './components/HeaderComponent';
import { parseCurrencyAmount } from '../utils/price-utils';
import { requireText } from '../utils/element-utils';

export class ProductPage extends TransientPage {
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

  async getProductTitle(): Promise<string> {
    return requireText(this.productTitle);
  }

  async getPriceText(): Promise<string> {
    return requireText(this.regularPrice);
  }

  async isOnSale(): Promise<boolean> {
    return this.originalPriceStrikethrough.isVisible();
  }

  async getSalePriceValue(): Promise<number> {
    return parseCurrencyAmount(await requireText(this.salePrice));
  }

  async getRegularPriceValue(): Promise<number> {
    return parseCurrencyAmount(await this.getPriceText());
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
    // Wait for AJAX cart update via polling on the header locator
    await this.header.waitForCartCountAbove(countBefore);
  }
}
