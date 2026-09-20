import { APIRequestContext, BrowserContext, request } from '@playwright/test';
import { UserData } from '../types/user-data';
import { LOCALE } from '../config/locale';

interface AuthApiResult {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>;
}

/**
 * Extracts CSRF token from the HTML page.
 * LiteCart stores it in a hidden input: <input name="token" value="...">
 */
function extractCsrfToken(html: string): string {
  const match = html.match(/<input[^>]+name="token"[^>]+value="([^"]+)"/);
  if (!match) {
    throw new Error('Could not extract CSRF token from page');
  }
  return match[1];
}

/**
 * Extracts session cookies from an API context and returns them
 * in a format suitable for {@link applyAuthCookies}.
 */
async function extractSessionCookies(apiContext: APIRequestContext): Promise<AuthApiResult> {
  const { cookies } = await apiContext.storageState();
  return {
    cookies: cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
    })),
  };
}

/**
 * Registers a new user via API (form POST) and returns session cookies.
 * This avoids slow UI interactions while achieving the same result.
 *
 * @param user - user data for registration
 * @param baseURL - application base URL (defaults to playwright config `use.baseURL`)
 */
export async function registerUserViaApi(user: UserData, baseURL: string): Promise<AuthApiResult> {
  const apiContext = await request.newContext({ baseURL });

  try {
    // Step 1: GET the registration page to obtain CSRF token and session cookie
    const pageResponse = await apiContext.get(`/${LOCALE}/create_account`);
    if (!pageResponse.ok()) {
      throw new Error(`Failed to load registration page: ${pageResponse.status()}`);
    }

    const html = await pageResponse.text();
    const token = extractCsrfToken(html);

    // Step 2: POST registration form data
    const formData = new URLSearchParams({
      token,
      tax_id: '',
      company: '',
      firstname: user.firstName,
      lastname: user.lastName,
      address1: user.address1,
      address2: '',
      postcode: user.postcode,
      city: user.city,
      country_code: getCountryCode(user.country),
      zone_code: user.zone ? getZoneCode(user.zone) : '',
      email: user.email,
      phone: user.phone,
      newsletter: '1',
      password: user.password,
      confirmed_password: user.password,
      create_account: 'Create Account',
    });

    const registerResponse = await apiContext.post(`/${LOCALE}/create_account`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData.toString(),
    });

    if (!registerResponse.ok() && registerResponse.status() !== 302) {
      throw new Error(`Registration failed: ${registerResponse.status()}`);
    }

    return await extractSessionCookies(apiContext);
  } finally {
    await apiContext.dispose();
  }
}

/**
 * Applies auth cookies to a browser context, making the user logged in.
 */
export async function applyAuthCookies(
  browserContext: BrowserContext,
  authResult: AuthApiResult,
): Promise<void> {
  await browserContext.addCookies(authResult.cookies);
}

/**
 * Maps country name to ISO country code.
 * Add entries here when tests need additional countries.
 */
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'United States': 'US',
    'United Kingdom': 'GB',
    Canada: 'CA',
    Germany: 'DE',
    France: 'FR',
  };
  return countryMap[country] || country;
}

/**
 * Maps US state name to zone code.
 * Only states actually used in test data are listed — add more as needed.
 */
function getZoneCode(zone: string): string {
  const zoneMap: Record<string, string> = {
    California: 'CA',
    Florida: 'FL',
    'New York': 'NY',
    Texas: 'TX',
  };
  return zoneMap[zone] || zone;
}
