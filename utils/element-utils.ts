import { Locator } from '@playwright/test';

/**
 * Returns the text content of a locator, trimmed.
 * Throws if the element returns null or blank/whitespace-only text.
 * Use for required values like prices, titles, order numbers.
 */
export async function requireNonEmptyText(locator: Locator): Promise<string> {
  const text = await locator.textContent();
  if (text === null || text.trim() === '') {
    throw new Error(`Element has no text content or is empty: ${locator}`);
  }
  return text.trim();
}

/**
 * Returns the attribute value of a locator.
 * Throws if the attribute is missing or blank/whitespace-only.
 * Use for required values like href links.
 */
export async function requireNonEmptyAttribute(
  locator: Locator,
  attribute: string,
): Promise<string> {
  const value = await locator.getAttribute(attribute);
  if (value === null || value.trim() === '') {
    throw new Error(`Attribute "${attribute}" is missing or empty on element: ${locator}`);
  }
  return value.trim();
}
