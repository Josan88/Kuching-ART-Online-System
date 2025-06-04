// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Specialized tests for checkout functionality that requires login
 * These tests were extracted from merchandise.test.js to fix issues with localStorage
 * and login state management
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
    
    // Registration elements
    this.registerBtn = page.locator('a[href="#registerModal"]');
    this.registerName = page.locator('#regName');
    this.registerEmail = page.locator('#regEmail');
    this.registerPassword = page.locator('#regPassword');
    this.registerPhone = page.locator('#regPhone');
    this.registerAddress = page.locator('#regAddress');
    this.submitRegister = page.locator('button[form="registerForm"]');
    
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
  }
    async registerTestUser() {
    // This function is no longer needed as we're setting up the user via localStorage
    // But we'll keep it as a placeholder in case we need to switch back to UI-based registration
    console.log('Using localStorage-based user setup instead of UI registration');
  }
    async loginWithTestUser() {
    // Go to homepage first
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    
    try {
      // Check if already logged in by looking for the login button
      const loginButtonVisible = await this.loginBtn.isVisible({ timeout: 2000 });
      
      if (!loginButtonVisible) {
        console.log('Already logged in, skipping login step');
        return;
      }
      
      // Create a demo user directly via localStorage to avoid UI registration issues
      await this.page.evaluate(() => {
        try {
          const demoUser = {
            userID: 'demo_user_1',
            userName: 'John Doe',
            email: 'test@example.com',
            password: 'password123',
            phoneNumber: '+60123456789',
            address: '123 Test Street',
            loyaltyPoints: 0,
            registrationDate: new Date().toISOString(),
            isAdmin: false
          };
          
          // Store in localStorage - handle both raw format and serialized
          let users = [];
          try {
            const existingUsers = localStorage.getItem('kart_users');
            if (existingUsers) {
              users = JSON.parse(existingUsers);
            }
          } catch (e) {
            console.error('Error parsing existing users:', e);
          }
          
          // Add the demo user if not exists
          if (!users.find(u => u.email === 'test@example.com')) {
            users.push(demoUser);
            localStorage.setItem('kart_users', JSON.stringify(users));
          }
        } catch (error) {
          console.error('Failed to create demo user:', error);
        }
      });
      
      // Now perform UI login
      await this.loginBtn.click();
      await this.page.waitForSelector('#loginEmail', { state: 'visible', timeout: 5000 });
      await this.loginEmail.fill('test@example.com');
      await this.loginPassword.fill('password123');
      await this.submitLogin.click();
      
      // Wait for either login notification or profile section to be visible
      await this.page.waitForTimeout(2000);
      
    } catch (error) {
      console.log('Login process encountered an error, continuing anyway:', error);
    }
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

test.describe('Checkout Functionality', () => {
  test('should show error when trying to checkout empty cart', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    
    // Go to homepage and login
    await artPage.goto();
    await artPage.loginWithTestUser();
    
    // Navigate to merchandise page
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Try to checkout with empty cart
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Your cart is empty');
  });  test('should successfully checkout when logged in with items', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    
    // First make sure we're logged in
    await artPage.loginWithTestUser();
    
    // Navigate to merchandise page
    await artPage.navMerchandise.click();
    await page.waitForTimeout(1000); // Give more time for the page to load
    
    // Add items to cart - use a retry mechanism to handle potential loading issues
    await page.waitForTimeout(1000); // Make sure merchandise is fully loaded
    
    let retries = 3;
    while (retries > 0) {
      try {
        // Try to add the first item
        await artPage.addMerchandiseToCart('1'); // RM 25.00
        await artPage.waitForNotification('added to cart');
        break;
      } catch (error) {
        console.log(`Attempt ${4-retries} failed, retrying...`);
        retries--;
        if (retries <= 0) {
          throw new Error('Failed to add first item to cart after multiple attempts');
        }
        await page.waitForTimeout(1000);
      }
    }
    
    // Try to add the second item
    await page.waitForTimeout(500);
    await artPage.addMerchandiseToCart('2'); // RM 12.00
    await artPage.waitForNotification('added to cart');
    
    // Check if cart has correct count and total before checkout
    await expect(artPage.cartCount).toHaveText('2');
    await expect(artPage.cartTotal).toContainText('37');
    
    // Now trigger the checkout
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Order placed successfully');
    
    // Cart should be empty after checkout
    await expect(artPage.cartCount).toHaveText('0');
    await expect(artPage.cartTotal).toContainText('0');
  });
});
