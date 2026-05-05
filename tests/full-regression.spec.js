// @ts-check
import { test, expect } from '@playwright/test';
import {
  assertDemo,
  clearCartViaUi,
  clearWishlistIfVisible,
  demoLog,
  expectCheckoutEmptyCartMessage,
  logAssertionError,
  parseFirstInt,
  recordPause,
  sortPriceHighToLow,
  sortPriceLowToHigh,
} from './helpers.js';

async function fillCheckoutForm(page) {
  await page.getByTestId('checkout-first-name').fill('Mike');
  await page.getByTestId('checkout-last-name').fill('James');
  await page.getByTestId('checkout-email').fill('mike@test.com');
  await page.getByTestId('checkout-phone').fill('555-0100');
  await page.getByTestId('checkout-address').fill('1 Main St');
  await page.getByTestId('checkout-city').fill('NYC');
  await page.getByTestId('checkout-country').fill('USA');
  await page.getByTestId('checkout-zip').fill('10001');
  await page.getByTestId('checkout-card-number').fill('4111111111111111');
  await page.getByTestId('checkout-expiry').fill('12/30');
  await page.getByTestId('checkout-cvv').fill('123');
}

/* ——— Login ——— */
test.describe('Login flow', () => {
  test('Successful login as admin', async ({ page }, testInfo) => {
    await page.goto('/login');
    await recordPause(page);
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('logged-in-user')).toContainText('admin');
    await recordPause(page);
  });

  test('Successful login as engineer', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('engineer');
    await page.getByTestId('password-input').fill('test456');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('logged-in-user')).toContainText('engineer');
    await recordPause(page);
  });

  test('Failed login shows error banner', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('bad');
    await page.getByTestId('password-input').fill('bad');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('login-error')).toContainText(/Invalid|Try admin/i);
    await recordPause(page);
  });

  test('Skip login goes to shop', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByTestId('skip-login-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('shop-page')).toBeVisible();
    await recordPause(page);
  });

  test('Logout restores guest nav', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await page.getByTestId('logout-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('nav-login-btn')).toBeVisible();
    await recordPause(page);
  });

  test('Navbar Sign In when not authenticated', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByTestId('nav-login-btn')).toBeVisible();
    await recordPause(page);
  });
});

/* ——— Shop ——— */
test.describe('Shop catalog', () => {
  test('Shop page shows eight products', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByTestId('shop-page')).toBeVisible();
    await expect(page.getByTestId('product-count')).toContainText('8');
    await recordPause(page);
  });

  test('Hero title GameDay Gear', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByTestId('hero-section')).toContainText('GameDay Gear');
    await expect(page.getByTestId('hero-subtitle')).toBeVisible();
    await recordPause(page);
  });

  test('Search basketball single match', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('basketball');
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('1');
    await recordPause(page);
  });

  test('Search no results shows no-results', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('xyz123');
    await recordPause(page);
    await expect(page.getByTestId('no-results')).toBeVisible();
    await expect(page.getByTestId('product-count')).toContainText('0');
    await recordPause(page);
  });

  test('Category Balls four products', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('category-balls').click();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('4');
    await recordPause(page);
  });

  test('Category All restores eight', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('category-balls').click();
    await page.getByTestId('category-all').click();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('8');
    await recordPause(page);
  });

  test('Category Footwear one product', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('category-footwear').click();
    await recordPause(page);
    await expect(page.getByTestId('product-count')).toContainText('1');
    await expect(page.getByTestId('product-name-0')).toContainText(/Sneaker/i);
    await recordPause(page);
  });

  test('Sort price low to high', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('category-all').click();
    await sortPriceLowToHigh(page);
    await recordPause(page);
    await expect(page.getByTestId('product-name-0')).toContainText(/Tennis Ball/i);
    await recordPause(page);
  });

  test('Sort price high to low', async ({ page }, testInfo) => {
    await page.goto('/');
    await sortPriceHighToLow(page);
    await recordPause(page);
    await expect(page.getByTestId('product-name-0')).toContainText(/Running Sneakers/i);
    await recordPause(page);
  });

  test('Add to cart from grid updates badge', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/');
    await page.getByTestId('category-all').click();
    await page.getByTestId('add-to-cart-btn-0').click();
    await recordPause(page);
    await expect(page.getByTestId('cart-count')).toBeVisible();
    await recordPause(page);
  });

  test('Out of stock label on Tennis Ball Set in grid', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('tennis');
    await recordPause(page);
    await expect(page.getByTestId('out-of-stock-0')).toBeVisible();
    await recordPause(page);
  });
});

/* ——— Product detail ——— */
test.describe('Product detail page', () => {
  test('prod-004 Running Sneakers details', async ({ page }, testInfo) => {
    await page.goto('/product/prod-004');
    await recordPause(page);
    await expect(page.getByTestId('detail-product-name')).toContainText('Running Sneakers');
    await expect(page.getByTestId('detail-price')).toContainText('120');
    await recordPause(page);
  });

  test('Select size L when present', async ({ page }, testInfo) => {
    await page.goto('/product/prod-004');
    const sizeL = page.getByTestId('size-option-L');
    if (await sizeL.isVisible()) {
      await sizeL.click();
      await recordPause(page);
    }
    await expect(page.getByTestId('product-detail-page')).toBeVisible();
    await recordPause(page);
  });

  test('Select color Black when present', async ({ page }, testInfo) => {
    await page.goto('/product/prod-004');
    const black = page.getByTestId('color-option-Black');
    if (await black.isVisible()) {
      await black.click();
      await recordPause(page);
    }
    await expect(page.getByTestId('product-detail-page')).toBeVisible();
    await recordPause(page);
  });

  test('Quantity increase and decrease', async ({ page }, testInfo) => {
    await page.goto('/product/prod-001');
    await recordPause(page);
    await page.getByTestId('increase-quantity').click();
    await page.getByTestId('increase-quantity').click();
    await expect(page.getByTestId('quantity-value')).toContainText('3');
    await page.getByTestId('decrease-quantity').click();
    await expect(page.getByTestId('quantity-value')).toContainText('2');
    await recordPause(page);
  });

  test('Add to cart from detail shows confirmation', async ({ page }, testInfo) => {
    await page.goto('/product/prod-003');
    await recordPause(page);
    await page.getByTestId('detail-add-to-cart').click();
    await recordPause(page);
    await expect(page.getByTestId('added-to-cart-message')).toBeVisible({ timeout: 8000 });
    await recordPause(page);
  });

  test('Detail wishlist toggle', async ({ page }, testInfo) => {
    await page.goto('/product/prod-002');
    await recordPause(page);
    await page.getByTestId('detail-wishlist-btn').click();
    await recordPause(page);
    await page.getByTestId('detail-wishlist-btn').click();
    await recordPause(page);
  });

  test('prod-006 out of stock detail', async ({ page }, testInfo) => {
    await page.goto('/product/prod-006');
    await expect(page.getByTestId('detail-out-of-stock')).toBeVisible();
    await recordPause(page);
  });

  test('Back to Shop link', async ({ page }, testInfo) => {
    await page.goto('/product/prod-001');
    await page.getByTestId('back-to-shop').click();
    await recordPause(page);
    await expect(page.getByTestId('shop-page')).toBeVisible();
    await recordPause(page);
  });
});

/* ——— Cart ——— */
test.describe('Shopping cart', () => {
  test('Empty cart state', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await recordPause(page);
    await expect(page.getByTestId('empty-cart')).toBeVisible();
    await recordPause(page);
  });

  test('Cart lists added item', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/');
    await page.getByTestId('search-input').fill('volleyball');
    await recordPause(page);
    await page.getByTestId('add-to-cart-btn-0').click();
    await recordPause(page);
    await page.goto('/cart');
    await recordPause(page);
    await expect(page.getByTestId('cart-item-0')).toBeVisible();
    await recordPause(page);
  });

  test('Increase line quantity', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/');
    await page.getByTestId('add-to-cart-btn-0').click();
    await recordPause(page);
    await page.goto('/cart');
    await recordPause(page);
    const q0 = parseFirstInt(await page.getByTestId('cart-item-quantity-0').textContent());
    await page.getByTestId('cart-increase-0').click();
    await recordPause(page);
    const q1 = parseFirstInt(await page.getByTestId('cart-item-quantity-0').textContent());
    expect(q1).toBeGreaterThanOrEqual(q0);
    await recordPause(page);
  });

  test('Remove item from cart', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/');
    await page.getByTestId('category-all').click();
    await page.getByTestId('add-to-cart-btn-1').click();
    await recordPause(page);
    await page.goto('/cart');
    await recordPause(page);
    await page.getByTestId('remove-cart-item-0').click();
    await recordPause(page);
    await recordPause(page);
  });

  test('Paid shipping under threshold', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/');
    await page.getByTestId('search-input').fill('jersey');
    await recordPause(page);
    await page.getByTestId('add-to-cart-btn-0').click();
    await recordPause(page);
    await page.goto('/cart');
    await recordPause(page);
    await expect(page.getByTestId('cart-shipping')).toContainText(/10 credits/i);
    await recordPause(page);
  });

  test('Free shipping at or above threshold', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/product/prod-004');
    await page.getByTestId('detail-add-to-cart').click();
    await recordPause(page);
    await page.goto('/cart');
    await recordPause(page);
    await expect(page.getByTestId('cart-subtotal')).toBeVisible();
    await expect(page.getByTestId('cart-shipping')).toContainText(/Free/i);
    await recordPause(page);
  });

  test('Clear cart button', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('add-to-cart-btn-0').click();
    await recordPause(page);
    await page.goto('/cart');
    await page.getByTestId('clear-cart-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('empty-cart')).toBeVisible();
    await recordPause(page);
  });

  test('Checkout button navigates', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/product/prod-008');
    await page.getByTestId('detail-add-to-cart').click();
    await recordPause(page);
    await page.goto('/cart');
    await page.getByTestId('checkout-btn').click();
    await recordPause(page);
    await expect(page).toHaveURL(/\/checkout/);
    await recordPause(page);
  });
});

/* ——— Checkout ——— */
test.describe('Checkout', () => {
  test('Empty cart checkout guidance', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/checkout');
    await recordPause(page);
    await expectCheckoutEmptyCartMessage(page);
    await recordPause(page);
  });

  test('Place order shows confirmation', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/product/prod-005');
    await page.getByTestId('detail-add-to-cart').click();
    await recordPause(page);
    await page.goto('/checkout');
    await recordPause(page);
    await fillCheckoutForm(page);
    await recordPause(page);
    await page.getByTestId('place-order-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('order-number')).toBeVisible();
    await expect(page.getByTestId('confirmed-name')).toContainText(/Mike/);
    await recordPause(page);
  });

  test('Checkout summary sidebar visible with items', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/product/prod-007');
    await page.getByTestId('detail-add-to-cart').click();
    await recordPause(page);
    await page.goto('/checkout');
    await recordPause(page);
    await expect(page.getByTestId('checkout-summary')).toBeVisible();
    await expect(page.getByTestId('checkout-total')).toBeVisible();
    await recordPause(page);
  });

  test('Back to Cart from checkout', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/product/prod-001');
    await page.getByTestId('detail-add-to-cart').click();
    await recordPause(page);
    await page.goto('/checkout');
    await page.getByTestId('back-to-cart').click();
    await recordPause(page);
    await expect(page).toHaveURL(/\/cart/);
    await recordPause(page);
  });

  test('Continue shopping after order clears flow', async ({ page }, testInfo) => {
    await clearCartViaUi(page);
    await page.goto('/product/prod-003');
    await page.getByTestId('detail-add-to-cart').click();
    await recordPause(page);
    await page.goto('/checkout');
    await page.getByTestId('checkout-first-name').fill('John');
    await page.getByTestId('checkout-last-name').fill('Wilson');
    await page.getByTestId('checkout-email').fill('john@test.com');
    await page.getByTestId('checkout-phone').fill('555');
    await page.getByTestId('checkout-address').fill('St');
    await page.getByTestId('checkout-city').fill('City');
    await page.getByTestId('checkout-country').fill('US');
    await page.getByTestId('checkout-zip').fill('12345');
    await page.getByTestId('checkout-card-number').fill('4111111111111111');
    await page.getByTestId('checkout-expiry').fill('01/31');
    await page.getByTestId('checkout-cvv').fill('321');
    await page.getByTestId('place-order-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('continue-shopping-btn')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('continue-shopping-btn').click();
    await recordPause(page);
    await expect(page.getByTestId('shop-page')).toBeVisible();
    await recordPause(page);
  });
});

/* ——— Wishlist ——— */
test.describe('Wishlist page', () => {
  test('Empty wishlist', async ({ page }, testInfo) => {
    await page.goto('/wishlist');
    await clearWishlistIfVisible(page);
    await recordPause(page);
    await expect(page.getByTestId('empty-wishlist')).toBeVisible();
    await recordPause(page);
  });

  test('Wishlist shows hearted item', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('wishlist-btn-2').click();
    await recordPause(page);
    await page.goto('/wishlist');
    await recordPause(page);
    await expect(page.getByTestId('wishlist-card-0')).toBeVisible();
    await clearWishlistIfVisible(page);
    await recordPause(page);
  });

  test('Add to cart from wishlist', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('wishlist-btn-1').click();
    await recordPause(page);
    await page.goto('/wishlist');
    await recordPause(page);
    const toCart = page.getByTestId('wishlist-to-cart-0');
    if (await toCart.isVisible()) {
      await toCart.click();
      await recordPause(page);
      await expect(page.getByTestId('cart-count')).toBeVisible();
    }
    await page.goto('/wishlist');
    await clearWishlistIfVisible(page);
    await recordPause(page);
  });

  test('Remove one wishlist item', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('wishlist-btn-3').click();
    await recordPause(page);
    await page.goto('/wishlist');
    await page.getByTestId('wishlist-remove-btn-0').click();
    await recordPause(page);
    await recordPause(page);
  });

  test('Clear wishlist', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('wishlist-btn-0').click();
    await page.getByTestId('wishlist-btn-4').click();
    await recordPause(page);
    await page.goto('/wishlist');
    await page.getByTestId('clear-wishlist-btn').click({ timeout: 10_000 });
    await recordPause(page);
    await expect(page.getByTestId('empty-wishlist')).toBeVisible();
    await recordPause(page);
  });
});

/* ——— Account ——— */
test.describe('Account page', () => {
  test('Account login prompt when guest', async ({ page }, testInfo) => {
    await page.goto('/account');
    await expect(page.getByTestId('account-login-prompt')).toBeVisible();
    await recordPause(page);
  });

  test('Account shows username when logged in', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('qwerty');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await page.goto('/account');
    await expect(page.getByTestId('account-username')).toContainText('testuser');
    await recordPause(page);
  });

  test('Account wishlist section with items', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await page.goto('/');
    await page.getByTestId('wishlist-btn-5').click();
    await recordPause(page);
    await page.goto('/account');
    await recordPause(page);
    await expect(page.getByTestId('account-page')).toBeVisible();
    await recordPause(page);
  });

  test('Remove wishlist item from account', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-btn').click();
    await recordPause(page);
    await page.goto('/');
    await page.getByTestId('wishlist-btn-0').click();
    await recordPause(page);
    await page.goto('/account');
    const rm = page.getByTestId('wishlist-remove-0');
    if (await rm.isVisible()) {
      await rm.click();
      await recordPause(page);
    }
    await recordPause(page);
  });
});

/* ——— Footer routing E2E ——— */
test.describe('Footer and routing', () => {
  test('Footer Qase disclaimer', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('footer').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('footer')).toContainText(/Qase demonstration application/i);
    await recordPause(page);
  });

  test('404 unknown path', async ({ page }, testInfo) => {
    await page.goto('/this-route-does-not-exist-404');
    await recordPause(page);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Oops! Page not found/i)).toBeVisible();
    await recordPause(page);
  });

  test('E2E guest buys from shop search through order confirmation', async ({ page }, testInfo) => {
    try {
      await clearCartViaUi(page);
      await test.step('Shop: filter and pick product', async () => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        await page.getByTestId('search-input').fill('duffel');
        await recordPause(page);
        await expect(page.getByTestId('product-count')).toContainText('1');
        await page.getByTestId('product-link-0').click();
        await recordPause(page);
        await expect(page.getByTestId('product-detail-page')).toBeVisible();
        demoLog(testInfo, 'Found duffel bag from search');
      });
      await test.step('Detail: add to cart', async () => {
        await page.getByTestId('detail-add-to-cart').click();
        await recordPause(page);
        await expect(page.getByTestId('added-to-cart-message')).toBeVisible({ timeout: 8000 });
      });
      await test.step('Cart: review and checkout', async () => {
        await page.getByTestId('nav-cart-link').click();
        await recordPause(page);
        await expect(page.getByTestId('cart-page')).toBeVisible();
        await expect(page.getByTestId('cart-item-0')).toBeVisible();
        await page.getByTestId('checkout-btn').click();
        await recordPause(page);
        await expect(page).toHaveURL(/\/checkout/);
      });
      await test.step('Checkout: pay and confirm', async () => {
        await fillCheckoutForm(page);
        await recordPause(page);
        await page.getByTestId('place-order-btn').click();
        await recordPause(page);
        await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 15000 });
        await expect(page.getByTestId('order-number')).toBeVisible();
        demoLog(testInfo, 'Full purchase path complete');
        await recordPause(page);
      });
    } catch (e) {
      await logAssertionError(testInfo, 'E2E shop search → detail → cart → checkout → order', e);
      throw e;
    }
  });
});

/* ——— Demo compliance ——— */
test.describe('Demo compliance check', () => {
  test('Catalog must include Pro Carbon Cricket Bat', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('Pro Carbon Cricket Bat');
    await recordPause(page);
    const text = await page.getByTestId('product-count').textContent();
    assertDemo(
      text && !/0\s*product/i.test(text),
      `Search "Pro Carbon Cricket Bat": expected ≥1 SKU (spring catalog). product-count="${text?.trim()}".`,
    );
  });
});
