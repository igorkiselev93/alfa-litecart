import { Page, Locator } from '@playwright/test';
import { StaticPage } from './StaticPage';
import { HeaderComponent } from './components/HeaderComponent';
import { SideMenuComponent } from './components/SideMenuComponent';
import { LOCALE } from '../config/locale';

export class HomePage extends StaticPage {
  protected readonly url = `/${LOCALE}/`;

  readonly header: HeaderComponent;
  readonly sideMenu: SideMenuComponent;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.sideMenu = new SideMenuComponent(page);
  }

  /** Find a product card link by its exact name */
  getProductLink(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true }).first();
  }

  /** Returns locator for campaign/sale product (has "Sale" badge) */
  getSaleProductLink(name: string): Locator {
    return this.page
      .locator(`li:has(em.sticker) a[href*="${name.toLowerCase().replace(' ', '-')}"]`)
      .first();
  }
}
