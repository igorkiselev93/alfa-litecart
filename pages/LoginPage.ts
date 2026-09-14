import { Page, Locator } from '@playwright/test';
import { NavigablePage } from './NavigablePage';
import { requireText } from '../utils/element-utils';
import { LOCALE } from '../config/locale';

export class LoginPage extends NavigablePage {
  protected readonly url = `/${LOCALE}/login`;

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
    this.errorNotice = page.locator(
      'xpath=//div[contains(@class,"notice") and contains(@class,"errors")]',
    );
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText(): Promise<string> {
    return requireText(this.errorNotice);
  }
}
