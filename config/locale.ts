/**
 * Locale prefix used in all page URLs.
 * Override via LOCALE environment variable to run tests in a different language.
 * Example: LOCALE=de npx playwright test
 */
export const LOCALE = process.env.LOCALE ?? 'en';
