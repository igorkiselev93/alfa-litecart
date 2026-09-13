import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { CreateAccountPage, UserData } from '../pages/CreateAccountPage';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

// Credentials for the pre-existing test account
const TEST_EMAIL = 'igorkiselev93@gmail.com';
const TEST_PASSWORD = 'JmfQdGYJqfi6gCawk0vz';

type MyFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  createAccountPage: CreateAccountPage;
  /** Dynamically registers a fresh user via Faker and returns credentials */
  registeredUser: UserData;
  authedRegisteredPage: HomePage;
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
    // LiteCart auto-logs in after registration
    await page.waitForSelector('#box-account a[href*="logout"]', { timeout: 15_000 });

    await use(new HomePage(page));
  },

  // Dynamic user registration fixture for test isolation
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
    // Wait for redirect after successful registration (success notice or account page)
    await page.waitForSelector('a[href*="logout"]', { timeout: 10_000 });

    await use(user);
  },
});

export { expect } from '@playwright/test';
