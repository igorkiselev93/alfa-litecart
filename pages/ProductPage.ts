import { Page, Locator } from '@playwright/test';
import { DynamicPage } from './DynamicPage';
import { HeaderComponent } from './components/HeaderComponent';
import { SideMenuComponent } from './components/SideMenuComponent';
import { parseCurrencyAmount } from '../utils/price-utils';
import { requireNonEmptyText } from '../utils/element-utils';

export class ProductPage extends DynamicPage {
  readonly header: HeaderComponent;
  readonly sideMenu: SideMenuComponent;
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
    this.sideMenu = new SideMenuComponent(page);
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

  async getProductTitle(): Promise<string> {
    return requireNonEmptyText(this.productTitle);
  }

  async getPriceText(): Promise<string> {
    return requireNonEmptyText(this.regularPrice);
  }

  async isOnSale(): Promise<boolean> {
    return this.originalPriceStrikethrough.isVisible();
  }

  async getOriginalPriceValue(): Promise<number> {
    return parseCurrencyAmount(await requireNonEmptyText(this.originalPriceStrikethrough));
  }

  async getSalePriceValue(): Promise<number> {
    return parseCurrencyAmount(await requireNonEmptyText(this.salePrice));
  }

  async getRegularPriceValue(): Promise<number> {
    return parseCurrencyAmount(await this.getPriceText());
  }

  /** Selects the given size option if the size dropdown is present on this product page */
  async selectSizeIfPresent(size = 'Small'): Promise<void> {
    if (await this.sizeSelect.isVisible()) {
      await this.sizeSelect.selectOption({ value: size });
    }
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(quantity = 1): Promise<void> {
    const countBefore = await this.header.getCartItemCount();
    await this.addToCartButton.click();
    // Wait for the header DOM to reflect the new count.
    // This implicitly guarantees the AJAX request completed and the page processed it.
    await this.header.waitForCartCount(countBefore + quantity);
  }
}
