import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { UserData } from '../types/user-data';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { registerUserViaApi, applyAuthCookies } from '../helpers/auth-api';

type MyFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  loggedInHomePage: HomePage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  // Registers a fresh isolated user via API (faster than UI).
  // Then navigates to HomePage with authenticated session.
  // Needed for parallel runs.
  loggedInHomePage: async ({ page, context, baseURL }, use) => {
    const user: UserData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address1: faker.location.streetAddress(),
      postcode: faker.location.zipCode('#####'),
      city: faker.location.city(),
      country: 'US',
      zone: 'NY',
      email: faker.internet.email({ provider: 'testmail.test' }),
      phone: faker.phone.number({ style: 'international' }),
      password: `Pass_${faker.string.alphanumeric(8)}1!`,
    };

    // Register user via API (skips slow UI interactions)
    const authResult = await registerUserViaApi(user, baseURL!);

    // Apply session cookies to browser context
    await applyAuthCookies(context, authResult);

    // Navigate to HomePage - user is already logged in
    const homePage = new HomePage(page);
    await homePage.goto();

    // Verify user is logged in
    await homePage.sideMenu.waitForLoginConfirmation();

    await use(homePage);
  },
});

export { expect } from '@playwright/test';
