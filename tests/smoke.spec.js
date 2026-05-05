// @ts-check
import { test, expect } from '@playwright/test';
import { clearCartViaUi, clearWishlistIfVisible, demoLog, recordPause } from './helpers.js';

test.describe('Smoke', () => {
  test('Shop loads with GameDay Gear hero and catalog', async ({ page }, testInfo) => {
    await test.step('Open shop home', async () => {
      demoLog(testInfo, 'Navigating to /');
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await recordPause(page);
    });
    await test.step('Hero and product grid visible', async () => {
      await expect(page.getByTestId('shop-page')).toBeVisible();
      await expect(page.getByTestId('hero-section')).toContainText('GameDay Gear');
      await expect(page.getByTestId('hero-subtitle')).toContainText(
        'Sports equipment, apparel, and accessories',
      );
      await expect(page.getByTestId('product-count')).toContainText('8');
      demoLog(testInfo, 'Shop page and 8-product catalog OK');
      await recordPause(page);
    });
  });

  test('Search finds Basketball', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await recordPause(page);
    await test.step('Type search query', async () => {
      demoLog(testInfo, 'Searching for basketball');
      await page.getByTestId('search-input').fill('basketball');
      await recordPause(page);
    });
    await test.step('Single result', async () => {
      await expect(page.getByTestId('product-count')).toContainText('1');
      await expect(page.getByTestId('product-name-0')).toContainText('Basketball');
      demoLog(testInfo, 'One product match');
      await recordPause(page);
    });
  });

  test('E2E add first catalog item and open cart from nav', async ({ page }, testInfo) => {
    await test.step('Start from clean cart', async () => {
      await clearCartViaUi(page);
      demoLog(testInfo, 'Cart cleared');
    });
    await test.step('Shop and add to cart from grid', async () => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.getByTestId('category-all').click();
      await recordPause(page);
      await page.getByTestId('add-to-cart-btn-0').click();
      await recordPause(page);
      demoLog(testInfo, 'Added product from grid');
    });
    await test.step('Navbar cart shows line item', async () => {
      await page.getByTestId('nav-cart-link').click();
      await recordPause(page);
      await expect(page.getByTestId('cart-page')).toBeVisible();
      await expect(page.getByTestId('cart-item-0')).toBeVisible();
      demoLog(testInfo, 'Cart page lists item');
      await recordPause(page);
    });
  });

  test('Shopping cart empty after clear', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await test.step('Empty cart message', async () => {
      demoLog(testInfo, 'Verifying empty-cart state');
      await expect(page.getByTestId('cart-page')).toBeVisible();
      await expect(page.getByTestId('empty-cart')).toBeVisible();
      await recordPause(page);
    });
  });

  test('Login page and skip login to shop', async ({ page }, testInfo) => {
    await test.step('Open login', async () => {
      await page.goto('/login');
      await recordPause(page);
      demoLog(testInfo, 'Login screen');
      await expect(page.getByTestId('login-page')).toBeVisible();
    });
    await test.step('Skip login → shop', async () => {
      await page.getByTestId('skip-login-btn').click();
      await recordPause(page);
      await expect(page).toHaveURL(/\//);
      await expect(page.getByTestId('shop-page')).toBeVisible();
      demoLog(testInfo, 'Guest on shop');
      await recordPause(page);
    });
  });

  test('Wishlist empty and footer Qase disclaimer', async ({ page }, testInfo) => {
    await test.step('Reset wishlist', async () => {
      await page.goto('/wishlist', { waitUntil: 'domcontentloaded' });
      await clearWishlistIfVisible(page);
      await recordPause(page);
      demoLog(testInfo, 'Wishlist route');
      await expect(page.getByTestId('wishlist-page')).toBeVisible();
      await expect(page.getByTestId('empty-wishlist')).toBeVisible();
      await recordPause(page);
    });
    await test.step('Footer on shop', async () => {
      await page.goto('/');
      await page.getByTestId('footer').scrollIntoViewIfNeeded();
      await recordPause(page);
      await expect(page.getByTestId('footer')).toContainText(/Qase demonstration application/i);
      demoLog(testInfo, 'Footer disclaimer visible');
      await recordPause(page);
    });
  });
});
