import { Page, Locator } from '@playwright/test';
import { TransientPage } from './TransientPage';
import { parseCurrencyAmount } from '../utils/price-utils';
import { requireNonEmptyText } from '../utils/element-utils';

/**
 * Column indices in the order items table:
 * Qty | Item | SKU | Unit Price | Tax | Sum
 */
const COL = {
  QTY: 0,
  ITEM: 1,
  SKU: 2,
  UNIT_PRICE: 3,
  TAX: 4,
  SUM: 5,
} as const;

export interface OrderLineItem {
  qty: number;
  item: string;
  sku: string;
  unitPrice: number;
  sum: number;
}

export class OrderReceiptPage extends TransientPage {
  readonly orderNumberText: Locator;
  readonly grandTotal: Locator;
  /** Data rows in the items table — skipping the header row (first tr in tbody) */
  readonly orderItemRows: Locator;

  constructor(page: Page) {
    super(page);
    // XPath: order number div inside header table (e.g. 'Order #714')
    this.orderNumberText = page.locator(
      'xpath=//h1/following-sibling::div[1]',
    );
    // Grand Total - last strong inside the totals table #
    this.grandTotal = page.locator(
      'xpath=//table[@id="order-total"]//tr[last()]//td[last()]',
    );
    // Items table has id="items" — skip first tr (header row) via :not(:first-child)
    this.orderItemRows = page.locator('table#items tbody tr:not(:first-child)');
  }

  /** Returns the order number string, e.g. "Order #714" */
  async getOrderNumber(): Promise<string> {
    return requireNonEmptyText(this.orderNumberText);
  }

  async getGrandTotalText(): Promise<string> {
    return requireNonEmptyText(this.grandTotal);
  }

  async getGrandTotalValue(): Promise<number> {
    return parseCurrencyAmount(await this.getGrandTotalText());
  }

  /** Returns all order line items as typed objects */
  async getOrderItems(): Promise<OrderLineItem[]> {
    const count = await this.orderItemRows.count();
    const items: OrderLineItem[] = [];

    for (let i = 0; i < count; i++) {
      const cells = this.orderItemRows.nth(i).locator('td');
      items.push({
        qty: parseInt(await requireNonEmptyText(cells.nth(COL.QTY)), 10),
        item: (await requireNonEmptyText(cells.nth(COL.ITEM))).trim(),
        sku: (await requireNonEmptyText(cells.nth(COL.SKU))).trim(),
        unitPrice: parseCurrencyAmount(await requireNonEmptyText(cells.nth(COL.UNIT_PRICE))),
        sum: parseCurrencyAmount(await requireNonEmptyText(cells.nth(COL.SUM))),
      });
    }

    return items;
  }
}
