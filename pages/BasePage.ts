import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(readonly page: Page) {}

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /** Returns the page title (<title> tag) */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
