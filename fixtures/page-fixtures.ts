import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { CreateAccountPage, UserData } from '../pages/CreateAccountPage';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

type MyFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  createAccountPage: CreateAccountPage;
  /**
   * Registers a fresh Faker user, logs them in, and returns HomePage.
   * Each test gets its own isolated account with an empty cart.
   * Safe for parallel execution.
   */
  authedRegisteredPage: HomePage;
  /** Dynamically registers a fresh user via Faker and returns credentials only */
  registeredUser: UserData;
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
  createAccountPage: async ({ page }, use) => {
    await use(new CreateAccountPage(page));
  },

  // Dynamic isolated account: registers + logs in a fresh Faker user per test.
  // Guarantees an empty cart and no shared state — safe for parallel runs.
  authedRegisteredPage: async ({ page }, use) => {
    const createAccountPage = new CreateAccountPage(page);

    const user: UserData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address1: faker.location.streetAddress(),
      postcode: faker.location.zipCode('#####'),
      city: faker.location.city(),
      country: 'United States',
      zone: 'New York',
      email: faker.internet.email({ provider: 'testmail.test' }),
      phone: faker.phone.number({ style: 'international' }),
      password: `Pass_${faker.string.alphanumeric(8)}1!`,
    };

    // Register
    await createAccountPage.goto();
    await createAccountPage.registerUser(user);
    // LiteCart auto-logs in after registration — wait via Page Object
    await createAccountPage.waitForLoginConfirmation();

    await use(new HomePage(page));
  },

  // Registers a fresh user and returns credentials (without navigating further).
  registeredUser: async ({ page }, use) => {
    const createAccountPage = new CreateAccountPage(page);

    const user: UserData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address1: faker.location.streetAddress(),
      postcode: faker.location.zipCode('#####'),
      city: faker.location.city(),
      country: 'United States',
      zone: 'New York',
      email: faker.internet.email({ provider: 'testmail.test' }),
      phone: faker.phone.number({ style: 'international' }),
      password: `Pass_${faker.string.alphanumeric(8)}1!`,
    };

    await createAccountPage.goto();
    await createAccountPage.registerUser(user);
    await createAccountPage.waitForLoginConfirmation();

    await use(user);
  },
});

export { expect } from '@playwright/test';
