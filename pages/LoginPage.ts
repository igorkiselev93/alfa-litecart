import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorNotice: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[name="login"]');
    // XPath: error notice div with class "notice errors"
    this.errorNotice = page.locator('xpath=//div[contains(@class,"notice") and contains(@class,"errors")]');
  }

  async goto(): Promise<void> {
    await super.goto('/en/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText(): Promise<string> {
    return (await this.errorNotice.textContent()) ?? '';
  }

  isLoggedIn(): Locator {
    // Sidebar shows "Logout" link when authenticated
    return this.page.locator('a[href*="logout"]');
  }
}
