// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Page Object Model for Merchandise/E-commerce functionality
 */
class KuchingARTPage {
  constructor(page) {
    this.page = page;
    
    // Navigation
    this.navMerchandise = page.locator('nav a[href="merchandise.html"]');
    
    // Auth elements
    this.loginBtn = page.locator('nav a.login-btn');
    this.loginEmail = page.locator('#loginEmail');
    this.loginPassword = page.locator('#loginPassword');
    this.submitLogin = page.locator('button[form="loginForm"]');
    
    // Merchandise elements
    this.categoryFilter = page.locator('#categoryFilter');
    this.searchInput = page.locator('#searchInput');
    this.cartCount = page.locator('#cartCount');
    this.cartTotal = page.locator('#cartTotal');
    this.checkoutBtn = page.locator('#checkoutBtn');
    // Notification
    this.notification = page.locator('[data-notification="true"]').last();
  }

  async goto() {
    await this.page.goto('/');
  }  // Login-related functionality moved to checkout-tests.js

  async login(email = 'test@example.com', password = 'password123') {
    await this.loginBtn.click();
    
    // Wait for the modal to be visible
    await this.page.waitForSelector('#loginModal.active', { timeout: 5000 });
    
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.submitLogin.click();
  }
  async addMerchandiseToCart(merchandiseId) {
    const addToCartBtn = this.page.locator(`[data-testid="add-to-cart-${merchandiseId}"]`);
    await addToCartBtn.click();
  }

  async waitForNotification(expectedText) {
    await expect(this.notification).toBeVisible();
    await expect(this.notification).toContainText(expectedText);
  }
}

test.describe('Merchandise Store', () => {  test('should display merchandise store interface', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
      await artPage.navMerchandise.click();
    
    // Check if main elements are visible
    await expect(page.getByRole('heading', { name: 'Official Merchandise' })).toBeVisible();
    await expect(artPage.categoryFilter).toBeVisible();
    await expect(artPage.searchInput).toBeVisible();
    await expect(page.locator('#merchandiseGrid')).toBeVisible();
    await expect(page.locator('#shopping-cart-section')).toBeVisible();
  });

  test('should display sample merchandise items', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    
    // Wait for merchandise to load
    await page.waitForTimeout(500);
    
    // Check if merchandise items are displayed
    const merchandiseItems = page.locator('.merchandise-item');
    await expect(merchandiseItems).toHaveCount(3);
      // Check specific items
    await expect(page.getByTestId('merchandise-1')).toBeVisible();
    await expect(page.getByTestId('merchandise-2')).toBeVisible();
    await expect(page.getByTestId('merchandise-3')).toBeVisible();
    
    // Check item details
    await expect(page.locator('.merchandise-item').first()).toContainText('Kuching ART T-Shirt');
    await expect(page.locator('.merchandise-item').first()).toContainText('RM 25.00');
  });

  test('should have correct category filter options', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
      // Check category options
    const categoryOptions = await artPage.categoryFilter.locator('option').allTextContents();
    expect(categoryOptions).toContain('All Categories');
    expect(categoryOptions).toContain('Clothing');
    expect(categoryOptions).toContain('Accessories');
    expect(categoryOptions).toContain('Souvenirs');
  });

  test('should filter merchandise by category', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Filter by clothing category
    await artPage.categoryFilter.selectOption('clothing');
    await page.waitForTimeout(300);
    
    // Should show only clothing items
    const visibleItems = page.locator('.merchandise-item:visible');
    await expect(visibleItems).toHaveCount(1);
    await expect(visibleItems.first()).toContainText('T-Shirt');
      // Filter by accessories
    await artPage.categoryFilter.selectOption('accessories');
    await page.waitForTimeout(300);
    
    // Should show only accessories
    await expect(page.locator('.merchandise-item:visible')).toHaveCount(1);
    await expect(page.locator('.merchandise-item:visible').first()).toContainText('Coffee Mug');
    
    // Reset filter
    await artPage.categoryFilter.selectOption('');
    await page.waitForTimeout(300);
    
    // Should show all items again
    await expect(page.locator('.merchandise-item')).toHaveCount(3);
  });

  test('should search merchandise by name and description', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Search for "mug"
    await artPage.searchInput.fill('mug');
    await page.waitForTimeout(300);
    
    // Should show only coffee mug
    const visibleItems = page.locator('.merchandise-item:visible');
    await expect(visibleItems).toHaveCount(1);
    await expect(visibleItems.first()).toContainText('Coffee Mug');
      // Search for "kuching"
    await artPage.searchInput.fill('kuching');
    await page.waitForTimeout(300);
    
    // Should show items with "kuching" in name or description
    await expect(page.locator('.merchandise-item:visible')).toHaveCount(2);
    
    // Clear search
    await artPage.searchInput.fill('');
    await page.waitForTimeout(300);
    
    // Should show all items
    await expect(page.locator('.merchandise-item')).toHaveCount(3);
  });

  test('should add items to cart', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Initial cart should be empty
    await expect(artPage.cartCount).toHaveText('0');
    await expect(artPage.cartTotal).toHaveText('0.00');
      // Add first item to cart
    await artPage.addMerchandiseToCart('1');
    await artPage.waitForNotification('Kuching ART T-Shirt added to cart!');
    
    // Check cart updates
    await expect(artPage.cartCount).toHaveText('1');
    await expect(artPage.cartTotal).toHaveText('25.00');
    
    // Add second item to cart
    await artPage.addMerchandiseToCart('2');
    await artPage.waitForNotification('ART Coffee Mug added to cart!');
    
    // Check cart updates
    await expect(artPage.cartCount).toHaveText('2');
    await expect(artPage.cartTotal).toHaveText('37.00'); // 25.00 + 12.00
  });

  test('should handle adding same item multiple times', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Add same item twice
    await artPage.addMerchandiseToCart('1');
    await artPage.waitForNotification('Kuching ART T-Shirt added to cart!');
    
    await artPage.addMerchandiseToCart('1');
    await artPage.waitForNotification('Kuching ART T-Shirt added to cart!');
    
    // Should have 2 items, total should be 50.00 (2 x 25.00)
    await expect(artPage.cartCount).toHaveText('2');
    await expect(artPage.cartTotal).toHaveText('50.00');
    
    // Cart items should show quantity
    await expect(page.locator('#cartItems')).toContainText('x2');
  });

  test('should display cart items correctly', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Add items to cart
    await artPage.addMerchandiseToCart('1'); // T-Shirt RM 25.00
    await artPage.addMerchandiseToCart('2'); // Mug RM 12.00
    await artPage.addMerchandiseToCart('3'); // Keychain RM 8.00
    
    // Check cart items display
    const cartItems = page.locator('#cartItems .cart-item');
    await expect(cartItems).toHaveCount(3);
    
    // Check individual items
    await expect(cartItems.first()).toContainText('Kuching ART T-Shirt x1');
    await expect(cartItems.first()).toContainText('RM 25.00');
      await expect(cartItems.nth(1)).toContainText('ART Coffee Mug x1');
    await expect(cartItems.nth(1)).toContainText('RM 12.00');
    
    await expect(cartItems.nth(2)).toContainText('Kuching ART Model Train x1');
    await expect(cartItems.nth(2)).toContainText('RM 8.00');
      // Check total
    await expect(artPage.cartTotal).toHaveText('45.00'); // 25 + 12 + 8
  });

  test('should require login for checkout', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Add item to cart
    await artPage.addMerchandiseToCart('1');
    
    // Try to checkout without login
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Please login to checkout');
    
    // Check if login modal appears
    await expect(page.locator('#loginModal')).toHaveClass(/active/);
  });  // Checkout tests moved to checkout-tests.js

  test('should handle combined category filter and search', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Filter by accessories and search for "mug"
    await artPage.categoryFilter.selectOption('accessories');
    await artPage.searchInput.fill('mug');
    await page.waitForTimeout(300);
    
    // Should show only coffee mug
    const visibleItems = page.locator('.merchandise-item:visible');
    await expect(visibleItems).toHaveCount(1);
    await expect(visibleItems.first()).toContainText('Coffee Mug');
    
    // Change search to something not in accessories
    await artPage.searchInput.fill('shirt');
    await page.waitForTimeout(300);
    
    // Should show no items (shirt is in clothing, not accessories)
    await expect(page.locator('.merchandise-item:visible')).toHaveCount(0);
  });

  test('should display correct item information', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Check first item (T-Shirt)
    const firstItem = page.getByTestId('merchandise-1');
    await expect(firstItem).toContainText('Kuching ART T-Shirt');
    await expect(firstItem).toContainText('Official Kuching ART branded t-shirt');
    await expect(firstItem).toContainText('RM 25.00');
    await expect(firstItem.locator('img')).toBeVisible();
    await expect(firstItem.getByTestId('add-to-cart-1')).toBeVisible();
    
    // Check second item (Mug)
    const secondItem = page.getByTestId('merchandise-2');
    await expect(secondItem).toContainText('ART Coffee Mug');    await expect(secondItem).toContainText('Ceramic coffee mug with ART logo');
    await expect(secondItem).toContainText('RM 12.00');
      // Check third item (Model Train)
    const thirdItem = page.getByTestId('merchandise-3');
    await expect(thirdItem).toContainText('Kuching ART Model Train');
    await expect(thirdItem).toContainText('Detailed model train replica of the Kuching ART system');
    await expect(thirdItem).toContainText('RM 8.00');
  });

  test('should handle rapid cart operations', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Rapidly add multiple items
    await artPage.addMerchandiseToCart('1');
    await artPage.addMerchandiseToCart('2');
    await artPage.addMerchandiseToCart('3');
    await artPage.addMerchandiseToCart('1'); // Add first item again
    
    // Wait for all notifications to appear
    await page.waitForTimeout(1000);
      // Check final cart state
    await expect(artPage.cartCount).toHaveText('4');
    await expect(artPage.cartTotal).toHaveText('70.00'); // (25*2) + 12 + 8 = 70
  });
});
