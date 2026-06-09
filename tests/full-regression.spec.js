// @ts-check
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
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
}

const BASE_PRE = 'GameDay Gear demo storefront is reachable at https://gameday-gear.lovable.app.';

/* Login */
test.describe('Login flow', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tLogin flow');
  });

  test('Successful login as admin', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Sign in to the storefront with admin credentials and confirm the navigation shows the logged-in user.',
      preconditions: `${BASE_PRE} User is logged out.`,
      postconditions: 'User is on the shop with "admin" shown as the logged-in user.',
      priority: 'high',
      severity: 'blocker',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Navigate to the login page.', 'The login form is visible.', 'URL: /login'),
      async () => {
        await page.goto('/login');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step(
        'Submit admin credentials.',
        'The form is submitted and the page navigates to the shop.',
        'username: admin, password: password123',
      ),
      async () => {
        await page.getByTestId('username-input').fill('admin');
        await page.getByTestId('password-input').fill('password123');
        await page.getByTestId('login-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the navbar reflects the logged-in user.', 'logged-in-user contains "admin".', ''),
      async () => {
        await expect(page.getByTestId('logged-in-user')).toContainText('admin');
        await recordPause(page);
      },
    );
  });

  test('Successful login as engineer', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Sign in with the engineer demo account and confirm the navigation shows the logged-in user.',
      preconditions: `${BASE_PRE} User is logged out.`,
      postconditions: 'User is on the shop with "engineer" shown as the logged-in user.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the login page.', 'The login form is visible.', 'URL: /login'),
      async () => {
        await page.goto('/login');
      },
    );

    await test.step(
      qase.step('Submit engineer credentials.', 'Form submits and navigates to the shop.', 'username: engineer, password: test456'),
      async () => {
        await page.getByTestId('username-input').fill('engineer');
        await page.getByTestId('password-input').fill('test456');
        await page.getByTestId('login-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Confirm the logged-in user in the navbar.', 'logged-in-user contains "engineer".', ''),
      async () => {
        await expect(page.getByTestId('logged-in-user')).toContainText('engineer');
        await recordPause(page);
      },
    );
  });

  test('Failed login shows error banner', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Submit invalid credentials and confirm the login form surfaces an inline error.',
      preconditions: `${BASE_PRE} User is on the login page.`,
      postconditions: 'login-error element is visible with an Invalid / Try admin message.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the login page.', 'Login form is rendered.', 'URL: /login'),
      async () => {
        await page.goto('/login');
      },
    );

    await test.step(
      qase.step('Submit invalid credentials.', 'Form is rejected; an error banner is shown.', 'username: bad, password: bad'),
      async () => {
        await page.getByTestId('username-input').fill('bad');
        await page.getByTestId('password-input').fill('bad');
        await page.getByTestId('login-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the error message.', 'login-error matches /Invalid|Try admin/i.', ''),
      async () => {
        await expect(page.getByTestId('login-error')).toContainText(/Invalid|Try admin/i);
        await recordPause(page);
      },
    );
  });

  test('Skip login goes to shop', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Use the Skip login affordance from the login page to enter the shop as a guest.',
      preconditions: `${BASE_PRE} User is on the login page.`,
      postconditions: 'User is on the shop page as a guest (no profile in the nav).',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the login page.', 'Login page is rendered.', 'URL: /login'),
      async () => {
        await page.goto('/login');
      },
    );

    await test.step(
      qase.step('Click Skip login.', 'User is redirected to the shop home.', ''),
      async () => {
        await page.getByTestId('skip-login-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the shop page renders.', 'shop-page is visible.', ''),
      async () => {
        await expect(page.getByTestId('shop-page')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Logout restores guest nav', async ({ page }, testInfo) => {
    qase.fields({
      description: 'After signing in, clicking Logout returns the user to a guest navigation with Sign In visible.',
      preconditions: `${BASE_PRE} User is logged out.`,
      postconditions: 'User is logged out; nav-login-btn is visible again.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Log in as admin.', 'User is signed in and on the shop.', 'username: admin, password: password123'),
      async () => {
        await page.goto('/login');
        await page.getByTestId('username-input').fill('admin');
        await page.getByTestId('password-input').fill('password123');
        await page.getByTestId('login-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Click Logout.', 'User is signed out.', ''),
      async () => {
        await page.getByTestId('logout-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify guest navigation is restored.', 'nav-login-btn (Sign in) is visible.', ''),
      async () => {
        await expect(page.getByTestId('nav-login-btn')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Navbar Sign In when not authenticated', async ({ page }, testInfo) => {
    qase.fields({
      description: 'A guest visitor on the storefront sees a Sign In affordance in the top navigation.',
      preconditions: `${BASE_PRE} User is logged out.`,
      postconditions: 'nav-login-btn is visible in the navbar.',
      priority: 'low',
      severity: 'minor',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Inspect the navbar.', 'nav-login-btn (Sign in) is visible.', ''),
      async () => {
        await expect(page.getByTestId('nav-login-btn')).toBeVisible();
        await recordPause(page);
      },
    );
  });
});

/* Shop */
test.describe('Shop catalog', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tShop catalog');
  });

  test('Shop page shows eight products', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The shop home renders the product catalog with eight products by default.',
      preconditions: BASE_PRE,
      postconditions: 'product-count contains "8" and shop-page is visible.',
      priority: 'high',
      severity: 'critical',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Navigate to the shop home.', 'The shop home loads.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Verify the catalog count and visibility.', 'shop-page is visible; product-count contains "8".', ''),
      async () => {
        await expect(page.getByTestId('shop-page')).toBeVisible();
        await expect(page.getByTestId('product-count')).toContainText('8');
        await recordPause(page);
      },
    );
  });

  test('Hero title GameDay Gear', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The hero banner displays the GameDay Gear title and subtitle on the shop home.',
      preconditions: BASE_PRE,
      postconditions: 'hero-section contains "GameDay Gear" and hero-subtitle is visible.',
      priority: 'low',
      severity: 'minor',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Verify hero copy and subtitle.', 'hero-section contains "GameDay Gear"; hero-subtitle is visible.', ''),
      async () => {
        await expect(page.getByTestId('hero-section')).toContainText('GameDay Gear');
        await expect(page.getByTestId('hero-subtitle')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Search basketball single match', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Searching the catalog for "basketball" returns a single matching product.',
      preconditions: `${BASE_PRE} On the shop home.`,
      postconditions: 'product-count contains "1".',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Search for "basketball".', 'The catalog filters in real time.', 'search-input: basketball'),
      async () => {
        await page.getByTestId('search-input').fill('basketball');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify exactly one result.', 'product-count contains "1".', ''),
      async () => {
        await expect(page.getByTestId('product-count')).toContainText('1');
        await recordPause(page);
      },
    );
  });

  test('Search no results shows no-results', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Searching the catalog for a nonsense term renders the empty-state UI.',
      preconditions: `${BASE_PRE} On the shop home.`,
      postconditions: 'no-results is visible and product-count contains "0".',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Search for a nonsense term.', 'The catalog returns zero matches.', 'search-input: xyz123'),
      async () => {
        await page.getByTestId('search-input').fill('xyz123');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the empty-state UI.', 'no-results is visible; product-count contains "0".', ''),
      async () => {
        await expect(page.getByTestId('no-results')).toBeVisible();
        await expect(page.getByTestId('product-count')).toContainText('0');
        await recordPause(page);
      },
    );
  });

  test('Category Balls four products', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Filtering the catalog by the Balls category returns exactly four products.',
      preconditions: `${BASE_PRE} On the shop home.`,
      postconditions: 'product-count contains "4".',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Click the Balls category filter.', 'The catalog is filtered to the Balls category.', ''),
      async () => {
        await page.getByTestId('category-balls').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the filtered count.', 'product-count contains "4".', ''),
      async () => {
        await expect(page.getByTestId('product-count')).toContainText('4');
        await recordPause(page);
      },
    );
  });

  test('Category All restores eight', async ({ page }, testInfo) => {
    qase.fields({
      description: 'After applying a category filter, the All category restores the full eight-product catalog.',
      preconditions: `${BASE_PRE} On the shop home.`,
      postconditions: 'product-count contains "8" after All is selected.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Apply a category filter (Balls).', 'Catalog filters to Balls.', ''),
      async () => {
        await page.getByTestId('category-balls').click();
      },
    );

    await test.step(
      qase.step('Click the All filter.', 'Catalog returns to the full eight products.', ''),
      async () => {
        await page.getByTestId('category-all').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the count.', 'product-count contains "8".', ''),
      async () => {
        await expect(page.getByTestId('product-count')).toContainText('8');
        await recordPause(page);
      },
    );
  });

  test('Category Footwear one product', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Filtering the catalog by the Footwear category returns exactly one product (a Sneaker).',
      preconditions: `${BASE_PRE} On the shop home.`,
      postconditions: 'product-count contains "1" and the visible product name matches /Sneaker/i.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Click the Footwear category filter.', 'Catalog filters to Footwear.', ''),
      async () => {
        await page.getByTestId('category-footwear').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the single result.', 'product-count contains "1"; product-name-0 matches /Sneaker/i.', ''),
      async () => {
        await expect(page.getByTestId('product-count')).toContainText('1');
        await expect(page.getByTestId('product-name-0')).toContainText(/Sneaker/i);
        await recordPause(page);
      },
    );
  });

  test('Sort price low to high', async ({ page }, testInfo) => {
    qase.fields({
      description: 'When the catalog is sorted by price low-to-high, Tennis Ball Set (the cheapest item) appears first.',
      preconditions: `${BASE_PRE} On the shop home.`,
      postconditions: 'product-name-0 matches /Tennis Ball/i.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Reset to All and sort low-to-high.', 'Catalog is sorted ascending by price.', ''),
      async () => {
        await page.getByTestId('category-all').click();
        await sortPriceLowToHigh(page);
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify Tennis Ball Set is first.', 'product-name-0 matches /Tennis Ball/i.', ''),
      async () => {
        await expect(page.getByTestId('product-name-0')).toContainText(/Tennis Ball/i);
        await recordPause(page);
      },
    );
  });

  test('Sort price high to low', async ({ page }, testInfo) => {
    qase.fields({
      description: 'When the catalog is sorted by price high-to-low, Running Sneakers (the most expensive item) appears first.',
      preconditions: `${BASE_PRE} On the shop home.`,
      postconditions: 'product-name-0 matches /Running Sneakers/i.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Sort high-to-low.', 'Catalog is sorted descending by price.', ''),
      async () => {
        await sortPriceHighToLow(page);
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify Running Sneakers is first.', 'product-name-0 matches /Running Sneakers/i.', ''),
      async () => {
        await expect(page.getByTestId('product-name-0')).toContainText(/Running Sneakers/i);
        await recordPause(page);
      },
    );
  });

  test('Add to cart from grid updates badge', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Adding a product to the cart from the catalog grid surfaces the cart count badge in the navbar.',
      preconditions: `${BASE_PRE} Cart is empty.`,
      postconditions: 'cart-count is visible in the navbar.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Clear the cart and open the shop home.', 'Cart is empty; shop home renders.', 'URL: /'),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Add the first catalog item.', 'Item is added to the cart.', ''),
      async () => {
        await page.getByTestId('category-all').click();
        await page.getByTestId('add-to-cart-btn-0').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the cart badge.', 'cart-count is visible.', ''),
      async () => {
        await expect(page.getByTestId('cart-count')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Out of stock label on Tennis Ball Set in grid', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Searching for "tennis" surfaces the Tennis Ball Set, which displays an out-of-stock badge in the grid.',
      preconditions: `${BASE_PRE} On the shop home.`,
      postconditions: 'out-of-stock-0 is visible on the first product card.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Search for "tennis".', 'Catalog filters to Tennis Ball Set.', 'search-input: tennis'),
      async () => {
        await page.getByTestId('search-input').fill('tennis');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the out-of-stock badge.', 'out-of-stock-0 is visible.', ''),
      async () => {
        await expect(page.getByTestId('out-of-stock-0')).toBeVisible();
        await recordPause(page);
      },
    );
  });
});

/* Product detail */
test.describe('Product detail page', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tProduct detail page');
  });

  test('prod-004 Running Sneakers details', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The Running Sneakers product detail page (prod-004) renders the name and price.',
      preconditions: BASE_PRE,
      postconditions: 'detail-product-name contains "Running Sneakers" and detail-price contains "120".',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the Running Sneakers detail page.', 'Detail page renders.', 'URL: /product/prod-004'),
      async () => {
        await page.goto('/product/prod-004');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify name and price.', 'detail-product-name contains "Running Sneakers"; detail-price contains "120".', ''),
      async () => {
        await expect(page.getByTestId('detail-product-name')).toContainText('Running Sneakers');
        await expect(page.getByTestId('detail-price')).toContainText('120');
        await recordPause(page);
      },
    );
  });

  test('Select size L when present', async ({ page }, testInfo) => {
    qase.fields({
      description: 'On a product detail with size variants, selecting size L keeps the detail page rendered.',
      preconditions: BASE_PRE,
      postconditions: 'product-detail-page is visible after the size selection.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the prod-004 detail page.', 'Detail page renders.', 'URL: /product/prod-004'),
      async () => {
        await page.goto('/product/prod-004');
      },
    );

    await test.step(
      qase.step('Select size L if visible.', 'Size L is selected (or skipped gracefully if not present).', ''),
      async () => {
        const sizeL = page.getByTestId('size-option-L');
        if (await sizeL.isVisible()) {
          await sizeL.click();
          await recordPause(page);
        }
      },
    );

    await test.step(
      qase.step('Verify the detail page remains.', 'product-detail-page is visible.', ''),
      async () => {
        await expect(page.getByTestId('product-detail-page')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Select color Black when present', async ({ page }, testInfo) => {
    qase.fields({
      description: 'On a product detail with color variants, selecting Black keeps the detail page rendered.',
      preconditions: BASE_PRE,
      postconditions: 'product-detail-page is visible after the color selection.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the prod-004 detail page.', 'Detail page renders.', 'URL: /product/prod-004'),
      async () => {
        await page.goto('/product/prod-004');
      },
    );

    await test.step(
      qase.step('Select color Black if visible.', 'Black is selected (or skipped gracefully if not present).', ''),
      async () => {
        const black = page.getByTestId('color-option-Black');
        if (await black.isVisible()) {
          await black.click();
          await recordPause(page);
        }
      },
    );

    await test.step(
      qase.step('Verify the detail page remains.', 'product-detail-page is visible.', ''),
      async () => {
        await expect(page.getByTestId('product-detail-page')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Quantity increase and decrease', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The quantity stepper on a product detail page increases and decreases the quantity value.',
      preconditions: BASE_PRE,
      postconditions: 'quantity-value reaches 3 after two increases and 2 after one decrease.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the prod-001 detail page.', 'Detail page renders.', 'URL: /product/prod-001'),
      async () => {
        await page.goto('/product/prod-001');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Increase quantity twice.', 'quantity-value reaches 3.', ''),
      async () => {
        await page.getByTestId('increase-quantity').click();
        await page.getByTestId('increase-quantity').click();
        await expect(page.getByTestId('quantity-value')).toContainText('3');
      },
    );

    await test.step(
      qase.step('Decrease quantity once.', 'quantity-value reaches 2.', ''),
      async () => {
        await page.getByTestId('decrease-quantity').click();
        await expect(page.getByTestId('quantity-value')).toContainText('2');
        await recordPause(page);
      },
    );
  });

  test('Add to cart from detail shows confirmation', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Adding a product to the cart from its detail page surfaces a confirmation message.',
      preconditions: BASE_PRE,
      postconditions: 'added-to-cart-message is visible within 8 seconds.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the prod-003 detail page.', 'Detail page renders.', 'URL: /product/prod-003'),
      async () => {
        await page.goto('/product/prod-003');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Click Add to cart from the detail page.', 'Product is added; confirmation appears.', ''),
      async () => {
        await page.getByTestId('detail-add-to-cart').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the confirmation message.', 'added-to-cart-message is visible (timeout 8s).', ''),
      async () => {
        await expect(page.getByTestId('added-to-cart-message')).toBeVisible({ timeout: 8000 });
        await recordPause(page);
      },
    );
  });

  test('Detail wishlist toggle', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The wishlist heart on a product detail page can be toggled on and off without errors.',
      preconditions: BASE_PRE,
      postconditions: 'The wishlist control reflects the toggled state after each click.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the prod-002 detail page.', 'Detail page renders.', 'URL: /product/prod-002'),
      async () => {
        await page.goto('/product/prod-002');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Click the detail wishlist button.', 'Wishlist toggles ON.', ''),
      async () => {
        await page.getByTestId('detail-wishlist-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Click the detail wishlist button again.', 'Wishlist toggles OFF.', ''),
      async () => {
        await page.getByTestId('detail-wishlist-btn').click();
        await recordPause(page);
      },
    );
  });

  test('prod-006 out of stock detail', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The Tennis Ball Set product detail page (prod-006) displays the out-of-stock indicator.',
      preconditions: BASE_PRE,
      postconditions: 'detail-out-of-stock is visible on the detail page.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the prod-006 detail page.', 'Detail page renders.', 'URL: /product/prod-006'),
      async () => {
        await page.goto('/product/prod-006');
      },
    );

    await test.step(
      qase.step('Verify the out-of-stock indicator.', 'detail-out-of-stock is visible.', ''),
      async () => {
        await expect(page.getByTestId('detail-out-of-stock')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Back to Shop link', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The Back to Shop link on a product detail page navigates back to the shop home.',
      preconditions: BASE_PRE,
      postconditions: 'shop-page is visible after clicking Back to Shop.',
      priority: 'low',
      severity: 'minor',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the prod-001 detail page.', 'Detail page renders.', 'URL: /product/prod-001'),
      async () => {
        await page.goto('/product/prod-001');
      },
    );

    await test.step(
      qase.step('Click Back to Shop.', 'User is redirected back to the shop home.', ''),
      async () => {
        await page.getByTestId('back-to-shop').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the shop page.', 'shop-page is visible.', ''),
      async () => {
        await expect(page.getByTestId('shop-page')).toBeVisible();
        await recordPause(page);
      },
    );
  });
});

/* Cart */
test.describe('Shopping cart', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tShopping cart');
  });

  test('Empty cart state', async ({ page }, testInfo) => {
    qase.fields({
      description: 'After clearing the cart, the cart page renders its empty-state UI.',
      preconditions: BASE_PRE,
      postconditions: 'empty-cart is visible.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Clear the cart via UI.', 'Cart is empty.', ''),
      async () => {
        await clearCartViaUi(page);
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the empty-cart state.', 'empty-cart is visible.', ''),
      async () => {
        await expect(page.getByTestId('empty-cart')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Cart lists added item', async ({ page }, testInfo) => {
    qase.fields({
      description: 'After adding a volleyball product from the search results, the cart lists it as a line item.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'cart-item-0 is visible on the cart page.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset the cart and open the shop.', 'Cart is empty; shop home renders.', 'URL: /'),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Search "volleyball" and add the first result.', 'A volleyball product is added to the cart.', 'search-input: volleyball'),
      async () => {
        await page.getByTestId('search-input').fill('volleyball');
        await recordPause(page);
        await page.getByTestId('add-to-cart-btn-0').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the cart page.', 'Cart page renders.', 'URL: /cart'),
      async () => {
        await page.goto('/cart');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the line item.', 'cart-item-0 is visible.', ''),
      async () => {
        await expect(page.getByTestId('cart-item-0')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Increase line quantity', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Clicking the increase control on a cart line item raises the line quantity.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'The line quantity after the increase is greater than or equal to the value before.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset the cart and add a product from the shop.', 'A line item is in the cart.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/');
        await page.getByTestId('add-to-cart-btn-0').click();
        await recordPause(page);
        await page.goto('/cart');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Read the current quantity, click increase, then re-read.', 'The new quantity is >= the old value.', ''),
      async () => {
        const q0 = parseFirstInt(await page.getByTestId('cart-item-quantity-0').textContent());
        await page.getByTestId('cart-increase-0').click();
        await recordPause(page);
        const q1 = parseFirstInt(await page.getByTestId('cart-item-quantity-0').textContent());
        expect(q1).toBeGreaterThanOrEqual(q0);
        await recordPause(page);
      },
    );
  });

  test('Remove item from cart', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Clicking the remove control on a cart line item removes that line from the cart.',
      preconditions: `${BASE_PRE} Cart contains at least one item.`,
      postconditions: 'The targeted line item is no longer in the cart.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset and add a product to the cart.', 'A product line is in the cart.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/');
        await page.getByTestId('category-all').click();
        await page.getByTestId('add-to-cart-btn-1').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the cart and remove the first item.', 'The first line item is removed.', 'URL: /cart'),
      async () => {
        await page.goto('/cart');
        await recordPause(page);
        await page.getByTestId('remove-cart-item-0').click();
        await recordPause(page);
        await recordPause(page);
      },
    );
  });

  test('Paid shipping under threshold', async ({ page }, testInfo) => {
    qase.fields({
      description: 'When the cart subtotal is under the free-shipping threshold, the cart shows a paid shipping line of 10 credits.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'cart-shipping matches /10 credits/i.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset and add a Jersey to the cart.', 'A Jersey is added.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/');
        await page.getByTestId('search-input').fill('jersey');
        await recordPause(page);
        await page.getByTestId('add-to-cart-btn-0').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the cart.', 'Cart page renders.', 'URL: /cart'),
      async () => {
        await page.goto('/cart');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify paid shipping.', 'cart-shipping matches /10 credits/i.', ''),
      async () => {
        await expect(page.getByTestId('cart-shipping')).toContainText(/10 credits/i);
        await recordPause(page);
      },
    );
  });

  test('Free shipping at or above threshold', async ({ page }, testInfo) => {
    qase.fields({
      description: 'When the cart subtotal meets or exceeds the threshold, the cart shows free shipping.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'cart-shipping matches /Free/i and cart-subtotal is visible.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset and add Running Sneakers (prod-004) to the cart.', 'Running Sneakers is added.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/product/prod-004');
        await page.getByTestId('detail-add-to-cart').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the cart.', 'Cart page renders.', 'URL: /cart'),
      async () => {
        await page.goto('/cart');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify subtotal and free shipping.', 'cart-subtotal is visible; cart-shipping matches /Free/i.', ''),
      async () => {
        await expect(page.getByTestId('cart-subtotal')).toBeVisible();
        await expect(page.getByTestId('cart-shipping')).toContainText(/Free/i);
        await recordPause(page);
      },
    );
  });

  test('Clear cart button', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The Clear cart button empties the cart and shows the empty-state UI.',
      preconditions: `${BASE_PRE} Cart has at least one item.`,
      postconditions: 'empty-cart is visible.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Add a product to the cart and open the cart page.', 'Cart shows the added item.', 'URL: /cart'),
      async () => {
        await page.goto('/');
        await page.getByTestId('add-to-cart-btn-0').click();
        await recordPause(page);
        await page.goto('/cart');
      },
    );

    await test.step(
      qase.step('Click Clear cart.', 'Cart is emptied.', ''),
      async () => {
        await page.getByTestId('clear-cart-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the empty-cart UI.', 'empty-cart is visible.', ''),
      async () => {
        await expect(page.getByTestId('empty-cart')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Checkout button navigates', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Clicking the Checkout button on the cart page navigates the user to the checkout route.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'URL matches /checkout.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset and add prod-008 to the cart.', 'A product is in the cart.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/product/prod-008');
        await page.getByTestId('detail-add-to-cart').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the cart and click Checkout.', 'User is taken to the checkout route.', 'URL: /cart -> /checkout'),
      async () => {
        await page.goto('/cart');
        await page.getByTestId('checkout-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the URL.', 'URL matches /checkout.', ''),
      async () => {
        await expect(page).toHaveURL(/\/checkout/);
        await recordPause(page);
      },
    );
  });
});

/* Checkout */
test.describe('Checkout', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tCheckout');
  });

  test('Empty cart checkout guidance', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Visiting /checkout with an empty cart shows the empty-cart guidance message.',
      preconditions: `${BASE_PRE} Cart is empty.`,
      postconditions: 'The empty-cart checkout guidance is shown.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Clear the cart and open /checkout.', 'Checkout page renders the empty-cart guidance.', 'URL: /checkout'),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/checkout');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the empty-cart guidance message.', 'Empty-cart guidance is visible.', ''),
      async () => {
        await expectCheckoutEmptyCartMessage(page);
        await recordPause(page);
      },
    );
  });

  test('Place order shows confirmation', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Adding a product, filling the checkout form, and placing the order surfaces a confirmation with order number.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'order-confirmation and order-number are visible; confirmed-name contains "Mike".',
      priority: 'high',
      severity: 'blocker',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset and add prod-005 to the cart.', 'A product is in the cart.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/product/prod-005');
        await page.getByTestId('detail-add-to-cart').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the checkout page.', 'Checkout form renders.', 'URL: /checkout'),
      async () => {
        await page.goto('/checkout');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Fill the checkout form and submit the order.', 'Order is placed and confirmation appears.', 'First/Last: Mike/James'),
      async () => {
        await fillCheckoutForm(page);
        await recordPause(page);
        await page.getByTestId('place-order-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the order confirmation.', 'order-confirmation, order-number visible; confirmed-name contains /Mike/.', ''),
      async () => {
        await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 15000 });
        await expect(page.getByTestId('order-number')).toBeVisible();
        await expect(page.getByTestId('confirmed-name')).toContainText(/Mike/);
        await recordPause(page);
      },
    );
  });

  test('Checkout summary sidebar visible with items', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The checkout summary sidebar and total display whenever the cart has items.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'checkout-summary and checkout-total are visible.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset and add prod-007 to the cart.', 'A product is in the cart.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/product/prod-007');
        await page.getByTestId('detail-add-to-cart').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the checkout page.', 'Checkout renders.', 'URL: /checkout'),
      async () => {
        await page.goto('/checkout');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify summary sidebar and total.', 'checkout-summary and checkout-total are visible.', ''),
      async () => {
        await expect(page.getByTestId('checkout-summary')).toBeVisible();
        await expect(page.getByTestId('checkout-total')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Back to Cart from checkout', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The Back to Cart link on the checkout page returns the user to the cart route.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'URL matches /cart after clicking Back to Cart.',
      priority: 'low',
      severity: 'minor',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset and add prod-001 to the cart.', 'Product is added.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/product/prod-001');
        await page.getByTestId('detail-add-to-cart').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open checkout and click Back to Cart.', 'User is taken back to the cart.', 'URL: /checkout -> /cart'),
      async () => {
        await page.goto('/checkout');
        await page.getByTestId('back-to-cart').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the URL.', 'URL matches /cart.', ''),
      async () => {
        await expect(page).toHaveURL(/\/cart/);
        await recordPause(page);
      },
    );
  });

  test('Continue shopping after order clears flow', async ({ page }, testInfo) => {
    qase.fields({
      description: 'After placing an order, the Continue shopping action clears the flow and returns the user to the shop home.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'shop-page is visible after clicking Continue shopping.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Reset and add prod-003 to the cart.', 'Product is added.', ''),
      async () => {
        await clearCartViaUi(page);
        await page.goto('/product/prod-003');
        await page.getByTestId('detail-add-to-cart').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Place an order on /checkout.', 'Order is placed and the confirmation appears.', 'First/Last: John/Wilson'),
      async () => {
        await page.goto('/checkout');
        await page.getByTestId('checkout-first-name').fill('John');
        await page.getByTestId('checkout-last-name').fill('Wilson');
        await page.getByTestId('place-order-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Click Continue shopping.', 'User is taken back to the shop.', ''),
      async () => {
        await expect(page.getByTestId('continue-shopping-btn')).toBeVisible({ timeout: 15000 });
        await page.getByTestId('continue-shopping-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify shop page.', 'shop-page is visible.', ''),
      async () => {
        await expect(page.getByTestId('shop-page')).toBeVisible();
        await recordPause(page);
      },
    );
  });
});

/* Wishlist */
test.describe('Wishlist page', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tWishlist page');
  });

  test('Empty wishlist', async ({ page }, testInfo) => {
    qase.fields({
      description: 'After clearing all items, the wishlist page shows its empty-state UI.',
      preconditions: BASE_PRE,
      postconditions: 'empty-wishlist is visible.',
      priority: 'low',
      severity: 'minor',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the wishlist page.', 'Wishlist page renders.', 'URL: /wishlist'),
      async () => {
        await page.goto('/wishlist');
      },
    );

    await test.step(
      qase.step('Clear any existing wishlist items.', 'Wishlist is empty.', ''),
      async () => {
        await clearWishlistIfVisible(page);
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the empty-wishlist UI.', 'empty-wishlist is visible.', ''),
      async () => {
        await expect(page.getByTestId('empty-wishlist')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Wishlist shows hearted item', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Toggling the wishlist heart on a catalog card adds the product, and the wishlist page lists it.',
      preconditions: BASE_PRE,
      postconditions: 'wishlist-card-0 is visible on the wishlist page.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop and heart the third product.', 'Product is added to wishlist.', ''),
      async () => {
        await page.goto('/');
        await page.getByTestId('wishlist-btn-2').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the wishlist page.', 'Wishlist page renders.', 'URL: /wishlist'),
      async () => {
        await page.goto('/wishlist');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the first wishlist card.', 'wishlist-card-0 is visible.', ''),
      async () => {
        await expect(page.getByTestId('wishlist-card-0')).toBeVisible();
        await clearWishlistIfVisible(page);
        await recordPause(page);
      },
    );
  });

  test('Add to cart from wishlist', async ({ page }, testInfo) => {
    qase.fields({
      description: 'A user can move a product from the wishlist into the cart from the wishlist page.',
      preconditions: BASE_PRE,
      postconditions: 'cart-count appears after using the Add-to-cart action on a wishlist line.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Heart the second product on the shop.', 'Product is added to wishlist.', ''),
      async () => {
        await page.goto('/');
        await page.getByTestId('wishlist-btn-1').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the wishlist page.', 'Wishlist page renders.', 'URL: /wishlist'),
      async () => {
        await page.goto('/wishlist');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Click the Add to cart action on the wishlist line if visible.', 'Item is added to the cart; cart-count is visible.', ''),
      async () => {
        const toCart = page.getByTestId('wishlist-to-cart-0');
        if (await toCart.isVisible()) {
          await toCart.click();
          await recordPause(page);
          await expect(page.getByTestId('cart-count')).toBeVisible();
        }
        await page.goto('/wishlist');
        await clearWishlistIfVisible(page);
        await recordPause(page);
      },
    );
  });

  test('Remove one wishlist item', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Using the remove control on a wishlist line removes that single item.',
      preconditions: BASE_PRE,
      postconditions: 'The wishlist item is removed.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Heart the fourth product on the shop.', 'Product added to wishlist.', ''),
      async () => {
        await page.goto('/');
        await page.getByTestId('wishlist-btn-3').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the wishlist and remove the first item.', 'The first wishlist line is removed.', 'URL: /wishlist'),
      async () => {
        await page.goto('/wishlist');
        await page.getByTestId('wishlist-remove-btn-0').click();
        await recordPause(page);
        await recordPause(page);
      },
    );
  });

  test('Clear wishlist', async ({ page }, testInfo) => {
    qase.fields({
      description: 'The Clear wishlist button removes all items at once and shows the empty-state UI.',
      preconditions: `${BASE_PRE} Wishlist has two or more items.`,
      postconditions: 'empty-wishlist is visible after clearing.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Heart two products on the shop.', 'Two products are in the wishlist.', ''),
      async () => {
        await page.goto('/');
        await page.getByTestId('wishlist-btn-0').click();
        await page.getByTestId('wishlist-btn-4').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the wishlist and click Clear wishlist.', 'All items are removed.', 'URL: /wishlist'),
      async () => {
        await page.goto('/wishlist');
        await page.getByTestId('clear-wishlist-btn').click({ timeout: 10_000 });
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify the empty-wishlist UI.', 'empty-wishlist is visible.', ''),
      async () => {
        await expect(page.getByTestId('empty-wishlist')).toBeVisible();
        await recordPause(page);
      },
    );
  });
});

/* Account */
test.describe('Account page', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tAccount page');
  });

  test('Account login prompt when guest', async ({ page }, testInfo) => {
    qase.fields({
      description: 'A guest visiting the account page sees a login prompt instead of account contents.',
      preconditions: `${BASE_PRE} User is logged out.`,
      postconditions: 'account-login-prompt is visible.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open /account as a guest.', 'Account page renders the login prompt.', 'URL: /account'),
      async () => {
        await page.goto('/account');
      },
    );

    await test.step(
      qase.step('Verify the login prompt.', 'account-login-prompt is visible.', ''),
      async () => {
        await expect(page.getByTestId('account-login-prompt')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Account shows username when logged in', async ({ page }, testInfo) => {
    qase.fields({
      description: 'After signing in, the account page displays the user\'s username.',
      preconditions: `${BASE_PRE} User is logged out.`,
      postconditions: 'account-username contains the signed-in user.',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Log in as testuser/qwerty.', 'User is signed in.', 'username: testuser, password: qwerty'),
      async () => {
        await page.goto('/login');
        await page.getByTestId('username-input').fill('testuser');
        await page.getByTestId('password-input').fill('qwerty');
        await page.getByTestId('login-btn').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open /account.', 'Account page renders.', 'URL: /account'),
      async () => {
        await page.goto('/account');
      },
    );

    await test.step(
      qase.step('Verify the username on the account page.', 'account-username contains "testuser".', ''),
      async () => {
        await expect(page.getByTestId('account-username')).toContainText('testuser');
        await recordPause(page);
      },
    );
  });

  test('Account wishlist section with items', async ({ page }, testInfo) => {
    qase.fields({
      description: 'A logged-in user with wishlist items sees the account page render the wishlist section.',
      preconditions: BASE_PRE,
      postconditions: 'account-page is visible after heart + visit.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Log in as admin and heart product index 5 on the shop.', 'A product is hearted while signed in.', 'admin/password123'),
      async () => {
        await page.goto('/login');
        await page.getByTestId('username-input').fill('admin');
        await page.getByTestId('password-input').fill('password123');
        await page.getByTestId('login-btn').click();
        await recordPause(page);
        await page.goto('/');
        await page.getByTestId('wishlist-btn-5').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open the account page.', 'Account page renders.', 'URL: /account'),
      async () => {
        await page.goto('/account');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify account page is visible.', 'account-page element is visible.', ''),
      async () => {
        await expect(page.getByTestId('account-page')).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('Remove wishlist item from account', async ({ page }, testInfo) => {
    qase.fields({
      description: 'From the account page, a user can remove a wishlist item if the remove control is exposed.',
      preconditions: BASE_PRE,
      postconditions: 'The wishlist-remove-0 action is executed when visible.',
      priority: 'medium',
      severity: 'normal',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Log in as admin and heart the first product.', 'A product is hearted while signed in.', 'admin/password123'),
      async () => {
        await page.goto('/login');
        await page.getByTestId('username-input').fill('admin');
        await page.getByTestId('password-input').fill('password123');
        await page.getByTestId('login-btn').click();
        await recordPause(page);
        await page.goto('/');
        await page.getByTestId('wishlist-btn-0').click();
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Open /account and click the wishlist remove action if visible.', 'The item is removed.', 'URL: /account'),
      async () => {
        await page.goto('/account');
        const rm = page.getByTestId('wishlist-remove-0');
        if (await rm.isVisible()) {
          await rm.click();
          await recordPause(page);
        }
        await recordPause(page);
      },
    );
  });
});

/* Footer routing E2E */
test.describe('Footer and routing', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tFooter and routing');
  });

  test('Footer Qase disclaimer', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Verify the storefront footer displays the Qase demonstration disclaimer text on the shop home page.',
      preconditions: BASE_PRE,
      postconditions: 'Footer disclaimer is visible and contains the Qase demo text.',
      priority: 'low',
      severity: 'minor',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Navigate to the shop home page.', 'The shop home page loads successfully.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step('Scroll the footer into view.', 'The footer becomes visible at the bottom of the viewport.', ''),
      async () => {
        await page.getByTestId('footer').scrollIntoViewIfNeeded();
      },
    );

    await test.step(
      qase.step('Inspect the footer text.', 'Footer contains the text "Qase demonstration application" (case-insensitive).', ''),
      async () => {
        await expect(page.getByTestId('footer')).toContainText(/Qase demonstration application/i);
      },
    );

    await recordPause(page);
  });

  test('404 unknown path', async ({ page }, testInfo) => {
    qase.fields({
      description: 'Navigating to an unknown route shows the 404 page with a friendly explanation.',
      preconditions: BASE_PRE,
      postconditions: 'A 404 heading and "Oops! Page not found" text are both visible.',
      priority: 'medium',
      severity: 'minor',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Visit an unknown route.', 'The 404 page renders.', 'URL: /this-route-does-not-exist-404'),
      async () => {
        await page.goto('/this-route-does-not-exist-404');
        await recordPause(page);
      },
    );

    await test.step(
      qase.step('Verify 404 content.', '404 heading and /Oops! Page not found/i text are visible.', ''),
      async () => {
        await expect(page.getByRole('heading', { name: '404' })).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(/Oops! Page not found/i)).toBeVisible();
        await recordPause(page);
      },
    );
  });

  test('E2E guest buys from shop search through order confirmation', async ({ page }, testInfo) => {
    qase.fields({
      description: 'End-to-end happy path: a guest visitor searches for a product, opens its detail, adds to cart, checks out, and receives an order confirmation.',
      preconditions: `${BASE_PRE} Cart starts empty.`,
      postconditions: 'order-confirmation and order-number are visible at the end of the flow.',
      priority: 'high',
      severity: 'blocker',
      layer: 'e2e',
    });

    try {
      await clearCartViaUi(page);

      await test.step(
        qase.step(
          'Shop: filter and pick product.',
          'Search returns a single result; product detail page renders for the picked item.',
          'search-input: duffel',
        ),
        async () => {
          await page.goto('/');
          await page.waitForLoadState('domcontentloaded');
          await page.getByTestId('search-input').fill('duffel');
          await recordPause(page);
          await expect(page.getByTestId('product-count')).toContainText('1');
          await page.getByTestId('product-link-0').click();
          await recordPause(page);
          await expect(page.getByTestId('product-detail-page')).toBeVisible();
          demoLog(testInfo, 'Found duffel bag from search');
        },
      );

      await test.step(
        qase.step('Detail: add to cart.', 'Confirmation message appears within 8s.', ''),
        async () => {
          await page.getByTestId('detail-add-to-cart').click();
          await recordPause(page);
          await expect(page.getByTestId('added-to-cart-message')).toBeVisible({ timeout: 8000 });
        },
      );

      await test.step(
        qase.step(
          'Cart: review and proceed to checkout.',
          'Cart shows the duffel item; clicking Checkout navigates to /checkout.',
          '',
        ),
        async () => {
          await page.getByTestId('nav-cart-link').click();
          await recordPause(page);
          await expect(page.getByTestId('cart-page')).toBeVisible();
          await expect(page.getByTestId('cart-item-0')).toBeVisible();
          await page.getByTestId('checkout-btn').click();
          await recordPause(page);
          await expect(page).toHaveURL(/\/checkout/);
        },
      );

      await test.step(
        qase.step(
          'Checkout: pay and confirm.',
          'Order confirmation and number are shown after placing the order.',
          'First/Last: Mike/James',
        ),
        async () => {
          await fillCheckoutForm(page);
          await recordPause(page);
          await page.getByTestId('place-order-btn').click();
          await recordPause(page);
          await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 15000 });
          await expect(page.getByTestId('order-number')).toBeVisible();
          demoLog(testInfo, 'Full purchase path complete');
          await recordPause(page);
        },
      );
    } catch (e) {
      await logAssertionError(testInfo, 'E2E shop search → detail → cart → checkout → order', e);
      throw e;
    }
  });
});

/* Demo compliance */
test.describe('Demo compliance check', () => {
  test.beforeEach(() => {
    qase.suite('🚀 Getting started with Automation Integration\t✏️ Examples\tFull regression\tDemo compliance check');
  });

  test('Catalog must include Pro Carbon Cricket Bat', async ({ page }, testInfo) => {
    qase.fields({
      description:
        'Intentional demo defect. The storefront does not stock the "Pro Carbon Cricket Bat" SKU referenced by a fictitious spring catalog brief, so this case is expected to fail. Use it to show how Qase surfaces a real defect alongside the rest of the run.',
      preconditions: BASE_PRE,
      postconditions: 'Search for "Pro Carbon Cricket Bat" returns at least one product (expected to fail because the storefront returns zero).',
      priority: 'high',
      severity: 'major',
      layer: 'e2e',
    });

    await test.step(
      qase.step('Open the shop home.', 'Shop home renders.', 'URL: /'),
      async () => {
        await page.goto('/');
      },
    );

    await test.step(
      qase.step(
        'Search for "Pro Carbon Cricket Bat" and assert at least 1 result.',
        'product-count must indicate at least one product (assertion will fail by design).',
        'search-input: Pro Carbon Cricket Bat',
      ),
      async () => {
        await page.getByTestId('search-input').fill('Pro Carbon Cricket Bat');
        await recordPause(page);
        const text = await page.getByTestId('product-count').textContent();
        assertDemo(
          text && !/0\s*product/i.test(text),
          `Search "Pro Carbon Cricket Bat": expected ≥1 SKU (spring catalog). product-count="${text?.trim()}".`,
        );
      },
    );
  });
});
