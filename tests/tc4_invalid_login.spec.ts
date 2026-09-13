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
  });
});