import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

export class ProductPage extends BasePage {
  readonly header: HeaderComponent;
  readonly productTitle: Locator;
  readonly regularPrice: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.productTitle = page.locator('h1[itemprop="name"]');
    // Regular price: div with class containing "price" but no sale
    this.regularPrice = page.locator('.price-wrapper');
    // Sale price: the discounted strong element
  }

  async goto(productPath: string): Promise<void> {
    await super.goto(productPath);
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

  async getRegularPriceValue(): Promise<number> {
    const text = await this.getPriceText();
    return this.parsePriceValue(text);
  }

}
