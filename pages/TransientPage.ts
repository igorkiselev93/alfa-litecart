import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Base class for pages without a fixed URL.
 * These pages are reached via navigation from other pages (e.g. redirects).
 * No goto() method — navigation is handled externally.
 */
export abstract class TransientPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}
