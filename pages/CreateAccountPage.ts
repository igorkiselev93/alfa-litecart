import { Page, Locator } from '@playwright/test';
import { NavigablePage } from './NavigablePage';
import { LOCALE } from '../config/locale';

export interface UserData {
  firstName: string;
  lastName: string;
  address1: string;
  postcode: string;
  city: string;
  country: string;
  zone?: string;
  email: string;
  phone: string;
  password: string;
}

export class CreateAccountPage extends NavigablePage {
  protected readonly url = `/${LOCALE}/create_account`;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly address1Input: Locator;
  readonly postcodeInput: Locator;
  readonly cityInput: Locator;
  readonly countrySelect: Locator;
  readonly zoneSelect: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountBtn: Locator;
  readonly phoneInput: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('input[name="firstname"]');
    this.lastNameInput = page.locator('input[name="lastname"]');
    this.address1Input = page.locator('input[name="address1"]');
    this.postcodeInput = page.locator('input[name="postcode"]');
    this.cityInput = page.locator('input[name="city"]');
    this.countrySelect = page.locator('select[name="country_code"]');
    this.zoneSelect = page.locator('select[name="zone_code"]:not([type="hidden"])');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmed_password"]');
    this.createAccountBtn = page.locator('button[name="create_account"]');
  }

  async registerUser(user: UserData): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.address1Input.fill(user.address1);
    await this.postcodeInput.fill(user.postcode);
    await this.cityInput.fill(user.city);

    await this.countrySelect.selectOption({ label: user.country });

    if (user.zone) {
      // Wait for zone select to become enabled after country selection
      await this.zoneSelect.waitFor({ state: 'visible' });
      await this.zoneSelect.selectOption({ label: user.zone });
    }

    await this.emailInput.fill(user.email);
    await this.phoneInput.fill(user.phone);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.createAccountBtn.click();
  }
}
