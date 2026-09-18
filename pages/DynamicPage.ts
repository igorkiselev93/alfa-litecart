import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Base class for pages with a dynamic (parametric) URL.
 * The URL is not known at construction time — it is passed to goto() at runtime.
 * Example: product pages (/en/rubber-ducks-c-1/red-duck-p-3)
 */
export abstract class DynamicPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }
}
