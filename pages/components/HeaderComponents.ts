import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
    constructor (private readonly page: Page) {
        this.page = Page;
    }
}