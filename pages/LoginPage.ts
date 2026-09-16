import { Page, Locator } from '@playwright/test';
import { StaticPage } from './StaticPage';
import { requireNonEmptyText } from '../utils/element-utils';
import { LOCALE } from '../config/locale';

export class LoginPage extends StaticPage {
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
    this.errorNotice = page.locator('div.notice.errors');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText(): Promise<string> {
    return requireNonEmptyText(this.errorNotice);
  }
}
