/**
 * Helpers for demo-friendly automation: visible pauses, logging, resilient flows for GameDay Gear.
 */

import { expect } from '@playwright/test';

/** Pause after a visible UI action so recordings/screenshots show each step clearly. */
export const RECORD_PAUSE_MS = 1000;

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} [ms]
 */
export async function recordPause(page, ms = RECORD_PAUSE_MS) {
  await page.waitForTimeout(ms);
}

/**
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {string} message
 */
export function demoLog(_testInfo, message) {
  console.log(`[GameDay QA] ${message}`);
}

export function assertDemo(condition, message) {
  if (!condition) {
    throw new Error(
      `ASSERTION FAILED — ${message}. ` +
        'See recording/screenshot for UI state. Fix the app or update the expected value.',
    );
  }
}

export async function logAssertionError(testInfo, context, err) {
  const msg = `[GameDay QA] CHECK FAILED: ${context} — ${err?.message || err}`;
  console.error(msg);
  try {
    await testInfo.attach('failure-context.txt', {
      body: msg,
      contentType: 'text/plain',
    });
  } catch {
    /* ignore */
  }
}

/**
 * Clear wishlist only when the control exists (it is omitted on an empty wishlist;
 * a bare .click() would wait the default ~30s for the locator).
 */
export async function clearWishlistIfVisible(page) {
  await page
    .getByTestId('clear-wishlist-btn')
    .click({ timeout: 2500 })
    .catch(() => {});
  await page.waitForTimeout(300);
}

/** Empty the cart when possible (fresh context per test, but keeps flows repeatable). */
export async function clearCartViaUi(page) {
  await page.goto('/cart');
  await page.waitForLoadState('domcontentloaded');
  const clear = page.getByTestId('clear-cart-btn');
  if (await clear.isVisible().catch(() => false)) {
    await clear.click();
    await page.waitForTimeout(400);
  }
}

/** Sort dropdown uses values: price-asc, price-desc (see app source). */
export async function sortPriceLowToHigh(page) {
  await page.getByTestId('sort-select').selectOption({ value: 'price-asc' });
}

export async function sortPriceHighToLow(page) {
  await page.getByTestId('sort-select').selectOption({ value: 'price-desc' });
}

export function parseFirstInt(text) {
  const m = String(text ?? '').match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

/** Checkout with no items: copy from live app. */
export async function expectCheckoutEmptyCartMessage(page) {
  await expect(page.getByTestId('checkout-page')).toBeVisible();
  await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
}
