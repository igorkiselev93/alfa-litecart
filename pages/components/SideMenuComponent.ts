import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class SideMenuComponent extends BaseComponent {
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page, page.locator('aside#navigation'));
    this.logoutLink = this.root.locator('a[href*="logout"]');
  }

  /** Returns the logout link locator — visible when user is authenticated */
  isLoggedIn(): Locator {
    return this.logoutLink;
  }

  /** Waits until the logout link appears — confirms successful login/registration */
  async waitForLoginConfirmation(timeout = 15_000): Promise<void> {
    await this.logoutLink.waitFor({ state: 'visible', timeout });
  }
}
