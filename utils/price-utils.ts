/**
 * Parses a currency amount from a string like "$20", "$59.99", or "€18.50".
 * Supports $ and € symbols. Returns 0 if no match found.
 */
export function parseCurrencyAmount(text: string): number {
  const match = text.match(/[$€](\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}
