import { Locator } from '@playwright/test';

/**
 * Returns the text content of a locator.
 * Throws if the element has no text content — use this instead of `?? ''`
 * to fail fast with a clear error message rather than silently returning empty string.
 */
export async function requireText(locator: Locator): Promise<string> {
  const text = await locator.textContent();
  if (text === null) {
    throw new Error(
      `Element has no text content: ${locator}`
    );
  }
  return text;
}

/**
 * Returns the attribute value of a locator.
 * Throws if the attribute is missing.
 */
export async function requireAttribute(locator: Locator, attribute: string): Promise<string> {
  const value = await locator.getAttribute(attribute);
  if (value === null) {
    throw new Error(
      `Attribute "${attribute}" not found on element: ${locator}`
    );
  }
  return value;
}
