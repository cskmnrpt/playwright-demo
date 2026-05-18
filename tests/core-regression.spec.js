// @ts-check
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import {
  assertDemo,
  clearCartViaUi,
  demoLog,
  expectCheckoutEmptyCartMessage,
  logAssertionError,
  recordPause,
  sortPriceLowToHigh,
} from './helpers.js';

test.describe('Login', () => {
  test.beforeEach(() => {
    qase.suite('Getting started with automation integration\tExamples\tCore regression\tLogin');
  });

  test(qase(28, 'Admin login redirects to shop with signed-in state'), async ({ page }, testInfo) => {
    // Misc demo: explicit fields on the result. Severity/priority/layer override the case defaults.
    qase.fields({ severity: 'blocker', priority: 'high', layer: 'e2e' });

    try {
      await page.goto('/login');
      await recordPause(page);
      await page.getByTestId('username-input').fill('admin');
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('login-btn').click();
      await recordPause(page);
      await expect(page).toHaveURL(/\//);
      await expect(page.getByTestId('logged-in-user')).toContainText('admin');
      demoLog(testInfo, 'Signed in as admin');
      await recordPause(page);
    } catch (e) {
      await logAssertionError(testInfo, 'Admin login', e);
      throw e;
    }
  });

  test(qase(29, 'Invalid credentials show login error'), async ({ page }, testInfo) => {
    await page.goto('/login');
    await recordPause(page);
    await page.getByTestId('username-input').fill('wrong');
    await page.getByTestId('password-input').fill('wrong');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toContainText(
      /Invalid|incorrect|Try admin|password123/i,
    );
    await recordPause(page);
  });

  test(qase(30, 'Skip login reaches shop without session'), async ({ page }, testInfo) => {
    await page.goto('/login');
    await recordPause(page);
    await page.getByTestId('skip-login-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('nav-login-btn')).toBeVisible();
    await expect(page.getByTestId('shop-page')).toBeVisible();
    await recordPause(page);
  });

  test(qase(31, 'Logout shows Sign In again'), async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await page.getByTestId('logout-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('nav-login-btn')).toBeVisible();
    await expect(page.getByTestId('logout-btn')).toHaveCount(0);
    await recordPause(page);
  });
});

test.describe('Shop catalog', () => {
  test.beforeEach(() => {
    qase.suite('Getting started with automation integration\tExamples\tCore regression\tShop catalog');
  });

  test(qase(32, 'Eight products and nav logo'), async ({ page }, testInfo) => {
    await page.goto('/');
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('8');
    await expect(page.getByTestId('nav-logo')).toContainText('GameDay Gear');
    demoLog(testInfo, 'Full catalog visible');
    await recordPause(page);
  });

  test(qase(33, 'Search basketball returns one product'), async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('basketball');
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('1');
    await expect(page.getByTestId('product-name-0')).toContainText('Basketball');
    await recordPause(page);
  });

  test(qase(34, 'Clear search restores full catalog'), async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('basketball');
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('1');
    await page.getByTestId('search-input').clear();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('8');
    await recordPause(page);
  });

  test(qase(35, 'Category Balls shows four products'), async ({ page }, testInfo) => {
    // Misc demo: parameters render alongside the result so categorical inputs are visible.
    qase.parameters({ Category: 'Balls', ExpectedCount: '4' });

    await page.goto('/');
    await page.getByTestId('category-balls').click();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('4');
    await recordPause(page);
  });

  test(qase(36, 'Category Apparel two products'), async ({ page }, testInfo) => {
    qase.parameters({ Category: 'Apparel', ExpectedCount: '2' });

    await page.goto('/');
    await page.getByTestId('category-apparel').click();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('2');
    await recordPause(page);
  });

  test(qase(37, 'Sort by price low puts Tennis Ball Set first'), async ({ page }, testInfo) => {
    // Misc demo: comment is shown in the result's actual-result field.
    qase.comment('Validates sort order: low-to-high by price. Tennis Ball Set is the cheapest item in the catalog so it must be first.');

    await page.goto('/');
    await page.getByTestId('category-all').click();
    await sortPriceLowToHigh(page);
    await recordPause(page);
    await expect(page.getByTestId('product-name-0')).toContainText(/Tennis Ball/i);
    await recordPause(page);
  });

  test(qase(38, 'Add to cart from catalog updates cart badge'), async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/');
    await page.getByTestId('category-all').click();
    await recordPause(page);
    await page.getByTestId('add-to-cart-btn-0').click();
    await recordPause(page);
    await expect(page.getByTestId('cart-count')).toBeVisible();
    await recordPause(page);
  });
});

test.describe('E2E product flows', () => {
  test.beforeEach(() => {
    qase.suite('Getting started with automation integration\tExamples\tCore regression\tE2E product flows');
  });

  test(qase(39, 'E2E Running Sneakers detail to cart'), async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/product/prod-004');
    await recordPause(page);
    await expect(page.getByTestId('detail-product-name')).toContainText('Running Sneakers');
    await expect(page.getByTestId('detail-price')).toContainText('120');
    const sizeL = page.getByTestId('size-option-L');
    if (await sizeL.isVisible().catch(() => false)) {
      await sizeL.click();
      await recordPause(page);
    }
    await page.getByTestId('detail-add-to-cart').click();
    await recordPause(page);
    await expect(page.getByTestId('added-to-cart-message')).toBeVisible({ timeout: 8000 });
    await page.goto('/cart');
    await recordPause(page);
    await expect(page.getByTestId('cart-item-0')).toBeVisible();
    await expect(page.getByTestId('cart-item-name-0')).toContainText(/Sneaker/i);
    demoLog(testInfo, 'Detail → cart line for sneakers');
    await recordPause(page);

    // Misc demo: attach a textual log inline to the Qase result.
    qase.attach({
      name: 'sneakers-flow.log',
      content: 'Running Sneakers (prod-004) added with size L. Cart confirmed line item present.',
      contentType: 'text/plain',
    });
  });

  test(qase(40, 'E2E search Jersey add to cart and verify line'), async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/');
    await page.getByTestId('search-input').fill('jersey');
    await recordPause(page);
    await page.getByTestId('add-to-cart-btn-0').click();
    await recordPause(page);
    await page.goto('/cart');
    await recordPause(page);
    await expect(page.getByTestId('cart-item-0')).toBeVisible();
    await expect(page.getByTestId('cart-item-name-0')).toContainText(/Jersey/i);
    demoLog(testInfo, 'Search → add → cart');
    await recordPause(page);
  });

  test(qase(41, 'Tennis Ball Set out of stock on product detail'), async ({ page }, testInfo) => {
    await page.goto('/product/prod-006');
    await recordPause(page);
    await expect(page.getByTestId('detail-out-of-stock')).toBeVisible();
    await recordPause(page);
  });
});

test.describe('Wishlist and account', () => {
  test.beforeEach(() => {
    qase.suite('Getting started with automation integration\tExamples\tCore regression\tWishlist and account');
  });

  test(qase(42, 'Wishlist heart toggle updates navbar'), async ({ page }, testInfo) => {
    await page.goto('/');
    await recordPause(page);
    await page.getByTestId('wishlist-btn-0').click();
    await recordPause(page);
    await expect(page.getByTestId('wishlist-count')).toBeVisible();
    await page.getByTestId('wishlist-btn-0').click();
    await recordPause(page);
  });

  test(qase(43, 'Account page prompts login when guest'), async ({ page }, testInfo) => {
    await page.goto('/account');
    await recordPause(page);
    await expect(page.getByTestId('account-login-prompt')).toBeVisible();
    await recordPause(page);
  });
});

test.describe('Checkout routing', () => {
  test.beforeEach(() => {
    qase.suite('Getting started with automation integration\tExamples\tCore regression\tCheckout routing');
  });

  test(qase(44, 'Checkout with empty cart shows guidance'), async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/checkout');
    await recordPause(page);
    await expectCheckoutEmptyCartMessage(page);
    await recordPause(page);
  });
});

test.describe('Routing and footer', () => {
  test.beforeEach(() => {
    qase.suite('Getting started with automation integration\tExamples\tCore regression\tRouting and footer');
  });

  test(qase(45, 'Not found route shows 404 content'), async ({ page }, testInfo) => {
    await page.goto('/nonexistent-route-smoke');
    await recordPause(page);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Oops! Page not found/i)).toBeVisible();
    await recordPause(page);
  });

  test(qase(46, 'Footer shows Qase demo disclaimer'), async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('footer').scrollIntoViewIfNeeded();
    await recordPause(page);
    await expect(page.getByTestId('footer')).toContainText(/Qase demonstration application/i);
    await recordPause(page);
  });
});

test.describe('Demo defect', () => {
  test.beforeEach(() => {
    qase.suite('Getting started with automation integration\tExamples\tCore regression\tDemo defect');
  });

  test(qase(47, 'Catalog must list nine products on shop home'), async ({ page }, testInfo) => {
    // Misc demo: qase.comment captures the "why" alongside the failure so triage is faster.
    // (qase.mute is not exported by playwright-qase-reporter v2.1.6; this case fails by design.)
    qase.comment(
      'Intentional demo defect. The storefront ships with 8 products today, but the (fictitious) FY26 merchandising brief calls for 9. Use this case to demonstrate how Qase records and triages a real defect.',
    );

    await page.goto('/');
    await recordPause(page);
    demoLog(testInfo, 'Checking product-count for FY26 assortment rule');
    const text = await page.getByTestId('product-count').textContent();
    const n = parseInt(String(text).replace(/\D/g, '') || '0', 10);
    assertDemo(
      n === 9,
      `Shop catalog: expected exactly 9 products per merchandising brief; product-count shows "${text?.trim()}". Update inventory or this demo assertion.`,
    );
  });
});
