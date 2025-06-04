// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Comprehensive Page Object Model for Integration Tests
 */
class KuchingARTPage {
  constructor(page) {
    this.page = page;
    
    // Navigation
    this.navHome = page.getByTestId('nav-home');
    this.navRoutes = page.getByTestId('nav-routes');
    this.navMerchandise = page.getByTestId('nav-merchandise');
    this.navProfile = page.getByTestId('nav-profile');
    
    // Auth elements
    this.loginBtn = page.getByTestId('login-btn');
    this.registerBtn = page.getByTestId('register-btn');
    this.logoutBtn = page.getByTestId('logout-btn');
    this.userName = page.getByTestId('user-name');
    
    // Login modal
    this.loginEmail = page.getByTestId('login-email');
    this.loginPassword = page.getByTestId('login-password');
    this.submitLogin = page.getByTestId('submit-login');
    
    // Register modal
    this.registerName = page.getByTestId('register-name');
    this.registerEmail = page.getByTestId('register-email');
    this.registerPassword = page.getByTestId('register-password');
    this.registerPhone = page.getByTestId('register-phone');
    this.registerAddress = page.getByTestId('register-address');
    this.submitRegister = page.getByTestId('submit-register');
    
    // Hero buttons
    this.bookTicketBtn = page.getByTestId('book-ticket-btn');
    this.browseMerchandiseBtn = page.getByTestId('browse-merchandise-btn');
    
    // Ticket booking
    this.originSelect = page.getByTestId('origin-select');
    this.destinationSelect = page.getByTestId('destination-select');
    this.departureDate = page.getByTestId('departure-date');
    this.departureTime = page.getByTestId('departure-time');
    this.ticketType = page.getByTestId('ticket-type');
    this.searchRoutesBtn = page.getByTestId('search-routes-btn');
    
    // Merchandise
    this.categoryFilter = page.getByTestId('category-filter');
    this.searchInput = page.getByTestId('search-input');
    this.cartCount = page.getByTestId('cart-count');
    this.cartTotal = page.getByTestId('cart-total');
    this.checkoutBtn = page.getByTestId('checkout-btn');
    
    // Profile
    this.profileName = page.getByTestId('profile-name');
    this.profileEmail = page.getByTestId('profile-email');
    this.loyaltyPoints = page.getByTestId('loyalty-points');
      // Notification
    this.notification = page.locator('[data-notification="true"]').last();
  }

  async goto() {
    await this.page.goto('/');
  }

  async register(userData = {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'securepass123',
    phone: '+60198765432',
    address: '456 Integration Street, Kuching, Sarawak'
  }) {
    await this.registerBtn.click();
    await this.registerName.fill(userData.name);
    await this.registerEmail.fill(userData.email);
    await this.registerPassword.fill(userData.password);
    await this.registerPhone.fill(userData.phone);
    await this.registerAddress.fill(userData.address);
    await this.submitRegister.click();
    return userData;
  }

  async login(email = 'test@example.com', password = 'password123') {
    await this.loginBtn.click();
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.submitLogin.click();
  }

  async searchAndBookTicket(searchData = {
    origin: 'kuching-central',
    destination: 'padungan',
    date: '2025-06-15',
    time: '10:00',
    type: 'standard'
  }) {
    await this.originSelect.selectOption(searchData.origin);
    await this.destinationSelect.selectOption(searchData.destination);
    await this.departureDate.fill(searchData.date);
    await this.departureTime.selectOption(searchData.time);
    await this.ticketType.selectOption(searchData.type);
    await this.searchRoutesBtn.click();
    
    // Wait for results and book
    await expect(this.page.locator('#routeResults')).toBeVisible();
    const bookButton = this.page.getByTestId('book-ticket-1');
    await bookButton.click();
  }

  async addMerchandiseToCart(merchandiseId) {
    const addToCartBtn = this.page.getByTestId(`add-to-cart-${merchandiseId}`);
    await addToCartBtn.click();
  }

  async waitForNotification(expectedText) {
    await expect(this.notification).toBeVisible();
    await expect(this.notification).toContainText(expectedText);
  }
}

test.describe('Integration Tests - Complete User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and sessionStorage to ensure test isolation
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Complete new user journey: Register → Book Ticket → Shop → Checkout', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Step 1: Register new user
    const userData = await artPage.register();
    await artPage.waitForNotification('Registration successful!');
    
    // Verify user is logged in
    await expect(artPage.userName).toContainText(userData.name);
    await expect(artPage.loginBtn).toBeHidden();
    await expect(artPage.registerBtn).toBeHidden();

    // Step 2: Book a ticket
    await artPage.navRoutes.click();
    await artPage.searchAndBookTicket();
    await artPage.waitForNotification('Ticket booked successfully!');

    // Step 3: Browse and shop for merchandise
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500); // Wait for merchandise to load
    
    // Add multiple items to cart
    await artPage.addMerchandiseToCart('1'); // T-Shirt RM 25.00
    await artPage.waitForNotification('Kuching ART T-Shirt added to cart!');
      await artPage.addMerchandiseToCart('2'); // Mug RM 12.00
    await artPage.waitForNotification('ART Coffee Mug added to cart!');
    
    await artPage.addMerchandiseToCart('3'); // Model Train RM 8.00
    await artPage.waitForNotification('Kuching ART Model Train added to cart!');

    // Verify cart state
    await expect(artPage.cartCount).toHaveText('3');
    await expect(artPage.cartTotal).toHaveText('45.00');

    // Step 4: Complete checkout
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Order placed successfully! Total: RM 45.00');

    // Verify cart is empty after checkout
    await expect(artPage.cartCount).toHaveText('0');
    await expect(artPage.cartTotal).toHaveText('0.00');

    // Step 5: Check profile
    await artPage.navProfile.click();
    await expect(artPage.profileName).toContainText(userData.name);
    await expect(artPage.profileEmail).toContainText(userData.email);
    await expect(artPage.loyaltyPoints).toContainText('0'); // New user starts with 0 points
  });

  test('Returning user journey: Login → Multiple ticket searches → Shopping with filters → Profile check', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Step 1: Login existing user
    await artPage.login('returning.user@example.com', 'mypassword');
    await artPage.waitForNotification('Login successful!');

    // Step 2: Search for multiple routes
    await artPage.navRoutes.click();

    // First search - Standard ticket
    await artPage.searchAndBookTicket({
      origin: 'kuching-central',
      destination: 'padungan',
      date: '2025-06-15',
      time: '08:00',
      type: 'standard'
    });
    await artPage.waitForNotification('Ticket booked successfully!');

    // Second search - Premium ticket, different route
    await artPage.searchAndBookTicket({
      origin: 'pending',
      destination: 'tabuan-jaya',
      date: '2025-06-16',
      time: '14:00',
      type: 'premium'
    });
    await artPage.waitForNotification('Ticket booked successfully!');

    // Step 3: Shop with filters
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);

    // Filter by clothing category
    await artPage.categoryFilter.selectOption('clothing');
    await page.waitForTimeout(300);
    await expect(page.locator('.merchandise-item:visible')).toHaveCount(1);

    // Add clothing item
    await artPage.addMerchandiseToCart('1');
    await artPage.waitForNotification('Kuching ART T-Shirt added to cart!');

    // Switch to accessories
    await artPage.categoryFilter.selectOption('accessories');
    await page.waitForTimeout(300);
    await expect(page.locator('.merchandise-item:visible')).toHaveCount(1);

    // Add accessory item
    await artPage.addMerchandiseToCart('2');
    await artPage.waitForNotification('ART Coffee Mug added to cart!');    // Use search instead of category filter
    await artPage.categoryFilter.selectOption(''); // Reset category
    await artPage.searchInput.fill('model train');
    await page.waitForTimeout(300);
    await expect(page.locator('.merchandise-item:visible')).toHaveCount(1);

    // Add searched item
    await artPage.addMerchandiseToCart('3');
    await artPage.waitForNotification('Kuching ART Model Train added to cart!');

    // Verify cart
    await expect(artPage.cartCount).toHaveText('3');
    await expect(artPage.cartTotal).toHaveText('45.00');

    // Step 4: Complete purchase
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Order placed successfully! Total: RM 45.00');

    // Step 5: Check updated profile
    await artPage.navProfile.click();
    await expect(artPage.profileName).toContainText('John Doe');
    await expect(artPage.loyaltyPoints).toContainText('150');
  });

  test('Guest user journey: Browse → Attempt actions → Forced login → Complete actions', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Step 1: Browse as guest
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);

    // Add items to cart as guest (should work)
    await artPage.addMerchandiseToCart('1');
    await artPage.waitForNotification('Kuching ART T-Shirt added to cart!');
    await expect(artPage.cartCount).toHaveText('1');

    // Step 2: Try to checkout without login
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Please login to checkout');
    await expect(page.locator('#loginModal')).toHaveClass(/active/);

    // Step 3: Login from modal
    await artPage.loginEmail.fill('guest.user@example.com');
    await artPage.loginPassword.fill('guestpassword');
    await artPage.submitLogin.click();
    await artPage.waitForNotification('Login successful!');

    // Step 4: Complete checkout after login
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Order placed successfully! Total: RM 25.00');

    // Step 5: Try ticket booking
    await artPage.navRoutes.click();
    await artPage.searchAndBookTicket();
    await artPage.waitForNotification('Ticket booked successfully!');
  });

  test('Error handling journey: Invalid searches → Empty cart checkout → Same origin/destination', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Step 1: Login first
    await artPage.login();
    await artPage.waitForNotification('Login successful!');

    // Step 2: Test ticket booking errors
    await artPage.navRoutes.click();

    // Try same origin and destination
    await artPage.originSelect.selectOption('kuching-central');
    await artPage.destinationSelect.selectOption('kuching-central');
    await artPage.departureDate.fill('2025-06-15');
    await artPage.departureTime.selectOption('10:00');
    await artPage.ticketType.selectOption('standard');
    await artPage.searchRoutesBtn.click();

    await artPage.waitForNotification('Origin and destination cannot be the same');
    await expect(page.locator('#routeResults')).toBeHidden();

    // Step 3: Test empty cart checkout
    await artPage.navMerchandise.click();
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Your cart is empty');

    // Step 4: Test merchandise filters with no results
    await artPage.categoryFilter.selectOption('accessories');
    await artPage.searchInput.fill('nonexistent item');
    await page.waitForTimeout(300);
    await expect(page.locator('.merchandise-item:visible')).toHaveCount(0);

    // Step 5: Successful recovery - clear filters and complete purchase
    await artPage.searchInput.fill('');
    await artPage.categoryFilter.selectOption('');
    await page.waitForTimeout(300);
    await expect(page.locator('.merchandise-item')).toHaveCount(3);

    // Complete successful transaction
    await artPage.addMerchandiseToCart('2');
    await artPage.waitForNotification('ART Coffee Mug added to cart!');
    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Order placed successfully! Total: RM 12.00');
  });

  test('Full session journey: Register → Use all features → Logout → Re-login', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Step 1: Register
    const userData = {
      name: 'Full Session User',
      email: 'fullsession@example.com',
      password: 'fullsessionpass',
      phone: '+60123456789',
      address: 'Full Session Address'
    };
    await artPage.register(userData);
    await artPage.waitForNotification('Registration successful!');

    // Step 2: Book tickets
    await artPage.navRoutes.click();
    await artPage.searchAndBookTicket();
    await artPage.waitForNotification('Ticket booked successfully!');

    // Step 3: Shop for merchandise
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Test filtering while shopping
    await artPage.categoryFilter.selectOption('clothing');
    await page.waitForTimeout(300);
    await artPage.addMerchandiseToCart('1');
    await artPage.waitForNotification('Kuching ART T-Shirt added to cart!');    await artPage.categoryFilter.selectOption('souvenirs');
    await page.waitForTimeout(300);
    await artPage.addMerchandiseToCart('3');
    await artPage.waitForNotification('Kuching ART Model Train added to cart!');

    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Order placed successfully! Total: RM 33.00');

    // Step 4: Check profile
    await artPage.navProfile.click();
    await expect(artPage.profileName).toContainText(userData.name);
    await expect(artPage.profileEmail).toContainText(userData.email);

    // Step 5: Logout
    await artPage.logoutBtn.click();
    await artPage.waitForNotification('Logged out successfully');
    await expect(artPage.loginBtn).toBeVisible();
    await expect(artPage.registerBtn).toBeVisible();

    // Step 6: Verify guest state
    await artPage.navProfile.click();
    // Profile should not show user data when logged out
    await expect(artPage.profileName).toBeEmpty();

    // Step 7: Re-login
    await artPage.login(userData.email, userData.password);
    await artPage.waitForNotification('Login successful!');
    await expect(artPage.userName).toContainText(userData.name);

    // Step 8: Verify profile data persists
    await artPage.navProfile.click();
    await expect(artPage.profileName).toContainText(userData.name);
    await expect(artPage.profileEmail).toContainText(userData.email);
  });

  test('Mobile responsive journey: Navigation and interactions on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Step 1: Test mobile navigation
    await expect(artPage.navHome).toBeVisible();
    await expect(artPage.navRoutes).toBeVisible();
    await expect(artPage.navMerchandise).toBeVisible();

    // Step 2: Register on mobile
    await artPage.register();
    await artPage.waitForNotification('Registration successful!');

    // Step 3: Book ticket on mobile
    await artPage.navRoutes.click();
    await artPage.searchAndBookTicket();
    await artPage.waitForNotification('Ticket booked successfully!');

    // Step 4: Shop on mobile
    await artPage.navMerchandise.click();
    await page.waitForTimeout(500);
    
    // Mobile shopping cart should still work
    await artPage.addMerchandiseToCart('1');
    await artPage.waitForNotification('Kuching ART T-Shirt added to cart!');
    await expect(artPage.cartCount).toHaveText('1');

    await artPage.checkoutBtn.click();
    await artPage.waitForNotification('Order placed successfully! Total: RM 25.00');

    // Step 5: Check profile on mobile
    await artPage.navProfile.click();
    await expect(artPage.profileName).toContainText('Jane Smith');
  });
});
