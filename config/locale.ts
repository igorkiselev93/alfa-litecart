/**
 * URL locale prefix used in all page paths (e.g. /en/, /en/login).
 * Override via LOCALE environment variable to point tests at a different URL prefix.
 *
 * NOTE: The suite is English-only. Selectors, parsed text (cart counters, prices,
 * order labels) and test data (product names, country labels) are all hardcoded for
 * the English version of litecart.stqa.ru. Changing LOCALE only affects URL paths —
 * it does not translate any assertions or test data.
 */
export const LOCALE = process.env.LOCALE ?? 'en';
