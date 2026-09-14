import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Base class for pages with a fixed URL (e.g. /en/login, /en/checkout).
 * Provides goto() based on the declared url.
 */
export abstract class NavigablePage extends BasePage {
  protected abstract readonly url: string;

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }
}
