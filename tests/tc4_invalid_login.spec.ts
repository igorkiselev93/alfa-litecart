import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';

const ERROR_MESSAGE = 'Wrong password or the account is disabled, or does not exist';

test.describe('TC-4: Invalid login (negative scenario)', () => {
  test('should show an error message on wrong credentials', async ({ loginPage }) => {
    await allure.epic('Authentication');
    await allure.feature('TC-4: Invalid login');
    await allure.story('User gets error on wrong credentials');

    // Step 1: Navigate to login page
    await allure.step('Step 1: Open login page', async () => {
      await loginPage.goto();
      expect(await loginPage.getTitle()).toMatch(/Login/i);
    });

    // Step 2: Enter valid email + wrong password
    await allure.step('Step 2: Enter valid email and wrong password', async () => {
      await loginPage.login('igorkiselev93@gmail.com', 'WrongPassword999!');
    });

    // Step 3: Verify error notice is visible
    await allure.step('Step 3: Verify error notice is visible', async () => {
      await expect(loginPage.errorNotice).toBeVisible();
    });

    // Step 4: Validate exact error message text
    await allure.step('Step 4: Validate error message text', async () => {
      const errorText = await loginPage.getErrorText();
      expect(errorText).toBe(ERROR_MESSAGE);
    });

    // Step 5: Verify error notice has error styling (red/pink background)
    await allure.step('Step 5: Verify error notice has red background color', async () => {
      await expect(loginPage.errorNotice).toHaveClass(/errors/);
      await expect(loginPage.errorNotice).toHaveCSS('background-color', 'rgb(255, 204, 204)');
    });

    // Step 6: Confirm user is NOT logged in — still on /login page, no redirect occurred
    await allure.step('Step 6: Confirm user is not logged in', async () => {
      expect(await loginPage.getCurrentUrl()).toContain('/login');
    });
  });
});
