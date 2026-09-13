import { test, expect } from '../fixtures/page-fixtures';
import * as allure from 'allure-js-commons';

// RegEx pattern for the error message
const ERROR_PATTERN = /wrong password|account is disabled|does not exist/i;

test.describe('TC-4: Невалидный логин (негативный сценарий)', () => {
  test('должен показать сообщение об ошибке при неверном пароле', async ({ loginPage }) => {
    await allure.epic('Authentication');
    await allure.feature('TC-4: Invalid login');
    await allure.story('User gets error on wrong credentials');

    // Step 1: Navigate to login page
    await allure.step('Шаг 1: Открыть страницу входа', async () => {
      await loginPage.goto();
      await expect(loginPage.page).toHaveTitle(/Login/i);
    });

    // Step 2: Enter valid email + wrong password
    await allure.step('Шаг 2: Ввести верный email и неверный пароль', async () => {
      await loginPage.login('igorkiselev93@gmail.com', 'WrongPassword999!');
    });

    // Step 3: Verify error notice is visible
    await allure.step('Шаг 3: Проверить появление ошибки', async () => {
      await expect(loginPage.errorNotice).toBeVisible();
    });

    // Step 4: Validate error text via RegEx
    await allure.step('Шаг 4: Проверить текст ошибки по RegEx', async () => {
        const errorText = await loginPage.getErrorText();
        expect(errorText).toMatch(ERROR_PATTERN);
      });
  
      // Step 5: Verify error notice has error styling (CSS class)
      await allure.step('Шаг 5: Проверить стилизацию ошибки (red/error container)', async () => {
        // The element has class "notice errors" — verify via CSS class check
        await expect(loginPage.errorNotice).toHaveClass(/errors/);
      });
  
      // Step 6: Confirm user is NOT logged in
      await allure.step('Шаг 6: Убедиться, что пользователь не авторизован', async () => {
        await expect(loginPage.page.locator('#box-account a[href*="logout"]')).toBeHidden();
      });
  });
});