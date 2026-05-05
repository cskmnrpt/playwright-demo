// @ts-check
import { test, expect } from '@playwright/test';
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
  test('Admin login redirects to shop with signed-in state', async ({ page }, testInfo) => {
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

  test('Invalid credentials show login error', async ({ page }, testInfo) => {
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

  test('Skip login reaches shop without session', async ({ page }, testInfo) => {
    await page.goto('/login');
    await recordPause(page);
    await page.getByTestId('skip-login-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('nav-login-btn')).toBeVisible();
    await expect(page.getByTestId('shop-page')).toBeVisible();
    await recordPause(page);
  });

  test('Logout shows Sign In again', async ({ page }, testInfo) => {
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
  test('Eight products and nav logo', async ({ page }, testInfo) => {
    await page.goto('/');
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('8');
    await expect(page.getByTestId('nav-logo')).toContainText('GameDay Gear');
    demoLog(testInfo, 'Full catalog visible');
    await recordPause(page);
  });

  test('Search basketball returns one product', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('basketball');
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('1');
    await expect(page.getByTestId('product-name-0')).toContainText('Basketball');
    await recordPause(page);
  });

  test('Clear search restores full catalog', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('basketball');
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('1');
    await page.getByTestId('search-input').clear();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('8');
    await recordPause(page);
  });

  test('Category Balls shows four products', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('category-balls').click();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('4');
    await recordPause(page);
  });

  test('Category Apparel two products', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('category-apparel').click();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('2');
    await recordPause(page);
  });

  test('Sort by price low puts Tennis Ball Set first', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('category-all').click();
    await sortPriceLowToHigh(page);
    await recordPause(page);
    await expect(page.getByTestId('product-name-0')).toContainText(/Tennis Ball/i);
    await recordPause(page);
  });

  test('Add to cart from catalog updates cart badge', async ({ page }, testInfo) => {
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
  test('E2E Running Sneakers detail to cart', async ({ page }, testInfo) => {
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
  });

  test('E2E search Jersey add to cart and verify line', async ({ page }, testInfo) => {
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

  test('Tennis Ball Set out of stock on product detail', async ({ page }, testInfo) => {
    await page.goto('/product/prod-006');
    await recordPause(page);
    await expect(page.getByTestId('detail-out-of-stock')).toBeVisible();
    await recordPause(page);
  });
});

test.describe('Wishlist and account', () => {
  test('Wishlist heart toggle updates navbar', async ({ page }, testInfo) => {
    await page.goto('/');
    await recordPause(page);
    await page.getByTestId('wishlist-btn-0').click();
    await recordPause(page);
    await expect(page.getByTestId('wishlist-count')).toBeVisible();
    await page.getByTestId('wishlist-btn-0').click();
    await recordPause(page);
  });

  test('Account page prompts login when guest', async ({ page }, testInfo) => {
    await page.goto('/account');
    await recordPause(page);
    await expect(page.getByTestId('account-login-prompt')).toBeVisible();
    await recordPause(page);
  });
});

test.describe('Checkout routing', () => {
  test('Checkout with empty cart shows guidance', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/checkout');
    await recordPause(page);
    await expectCheckoutEmptyCartMessage(page);
    await recordPause(page);
  });
});

test.describe('Routing and footer', () => {
  test('Not found route shows 404 content', async ({ page }, testInfo) => {
    await page.goto('/nonexistent-route-smoke');
    await recordPause(page);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Oops! Page not found/i)).toBeVisible();
    await recordPause(page);
  });

  test('Footer shows Qase demo disclaimer', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('footer').scrollIntoViewIfNeeded();
    await recordPause(page);
    await expect(page.getByTestId('footer')).toContainText(/Qase demonstration application/i);
    await recordPause(page);
  });
});

test.describe('Demo defect', () => {
  test('Catalog must list nine products on shop home', async ({ page }, testInfo) => {
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
