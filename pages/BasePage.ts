import { Page } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly url: string;

  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
