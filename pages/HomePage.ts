import { Page } from '@playwright/test';
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
}
