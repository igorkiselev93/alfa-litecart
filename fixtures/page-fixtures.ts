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

  // Registers + logs in a fresh isolated user.
  // Needs for parallel runs.
  loggedInHomePage: async ({ page }, use) => {
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

    // It redirects to HomePage after registration
    const homePage = new HomePage(page);
    await homePage.sideMenu.waitForLoginConfirmation();

    await use(homePage);
  },
});

export { expect } from '@playwright/test';
