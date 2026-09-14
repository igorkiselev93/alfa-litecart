import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly url: string;

  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /** Logout link visible in sidebar when user is authenticated */
  isLoggedIn(): Locator {
    return this.page.locator('#box-account a[href*="logout"]');
  }

  /** Waits until the logout link appears — confirms successful login/registration */
  async waitForLoginConfirmation(timeout = 15_000): Promise<void> {
    await this.isLoggedIn().waitFor({ state: 'visible', timeout });
  }

  /** Returns the page title for assertions */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
