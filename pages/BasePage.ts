import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(readonly page: Page) {}

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /** Returns the page title (<title> tag) */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Logout link visible in sidebar when user is authenticated */
  isLoggedIn(): Locator {
    return this.page.locator('#box-account a[href*="logout"]');
  }

  /** Waits until the logout link appears — confirms successful login/registration */
  async waitForLoginConfirmation(timeout = 15_000): Promise<void> {
    await this.isLoggedIn().waitFor({ state: 'visible', timeout });
  }

  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
