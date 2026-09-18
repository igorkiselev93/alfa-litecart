import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Base class for pages with a fixed, known URL (e.g. /en/login, /en/checkout).
 * Subclasses must declare their url and get goto() for free.
 */
export abstract class StaticPage extends BasePage {
  protected abstract readonly url: string;

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }
}
