/**
 * Parses a currency amount from a string like "$20", "$59.99", "$1,234.56" or "€18.50".
 *
 * Supported formats:
 *   - Symbol before amount: $20, $59.99, $1,234.56, €18.50
 *   - Thousands separator: comma (e.g. $1,234.56)
 *   - Decimal separator: dot only (e.g. $18.50)
 *
 * NOT supported (European comma-decimal format):
 *   - €18,50 — will throw, not silently return 0 or partial value
 *
 * Throws if no valid currency amount is found in the input,
 * so parse failures are never silently treated as zero.
 */
export function parseCurrencyAmount(text: string): number {
  // Match $ or €, followed by digits with optional thousands commas and decimal dot
  const match = text.match(/[$€]([\d,]+(?:\.\d+)?)/);
  if (!match) {
    throw new Error(`Failed to parse currency amount from: "${text}"`);
  }
  // Remove thousands separators before parsing
  const normalized = match[1].replace(/,/g, '');
  return parseFloat(normalized);
}

/**
 * Multiplies a unit price by quantity and rounds to 2 decimal places.
 * Use this instead of raw multiplication when comparing monetary totals,
 * to avoid floating-point precision errors (e.g. 19.9 * 3 = 59.699999999999996).
 */
export function calcTotal(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity * 100) / 100;
}
