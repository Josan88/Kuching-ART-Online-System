// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Page Object Model for Kuching ART System
 * Updated to use actual HTML selectors instead of test IDs
 */
class KuchingARTPage {
  constructor(page) {
    this.page = page;
    
    // Navigation elements - using actual HTML structure
    this.navHome = page.locator('nav a[href="index.html"]');
    this.navRoutes = page.locator('nav a[href="#routes"]');
    this.navMerchandise = page.locator('nav a[href="merchandise.html"]');
    this.navSchedules = page.locator('nav a[href="#schedules"]');
    this.navFares = page.locator('nav a[href="#fares"]');
    this.navContact = page.locator('nav a[href="#contact"]');
    this.navFeedback = page.locator('nav a[href="feedback.html"]');
    
    // Auth elements - using actual HTML structure
    this.loginBtn = page.locator('nav a.login-btn, a[href="login.html"]');
    this.logoutBtn = page.locator('#logoutBtn, .logout-btn, button:has-text("Logout")');
    this.userName = page.locator('#userName, .user-name');
      // Hero section elements - using actual HTML structure  
    this.bookTicketBtn = page.locator('.hero-buttons a[href="booking.html"]').first();
    this.viewSchedulesBtn = page.locator('.hero-buttons a[href="#schedules"]');
    
    // Welcome heading - using actual HTML structure
    this.welcomeHeading = page.locator('h2:has-text("Welcome to Kuching"), .hero-content h2');
    
    // Ticket booking elements - using actual HTML IDs from the form
    this.originSelect = page.locator('#origin');
    this.destinationSelect = page.locator('#destination');
    this.departureDate = page.locator('#date');
    this.searchBtn = page.locator('button:has-text("Search")');
    
    // Section elements
    this.featuresSection = page.locator('#features');
    this.schedulesSection = page.locator('#schedules'); 
    this.routesSection = page.locator('#routes');
    this.faresSection = page.locator('#fares');
    this.contactSection = page.locator('#contact');
    this.categoryFilter = page.getByTestId('category-filter');
    this.searchInput = page.getByTestId('search-input');
    this.cartCount = page.getByTestId('cart-count');
    this.cartTotal = page.getByTestId('cart-total');
    this.checkoutBtn = page.getByTestId('checkout-btn');    
    // Authentication elements - using actual login.html structure
    this.loginEmail = page.locator('#loginEmail');
    this.loginPassword = page.locator('#loginPassword');
    this.submitLogin = page.locator('#loginForm button[type="submit"]');
    
    // Register elements - using actual login.html structure  
    this.registerBtn = page.locator('#register-tab');
    this.registerName = page.locator('#fullName');
    this.registerEmail = page.locator('#registerEmail');
    this.registerPassword = page.locator('#registerPassword');
    this.registerPhone = page.locator('#phoneNumber');
    this.registerAddress = page.locator('#address');
    this.submitRegister = page.locator('#registerForm button[type="submit"]');
    
    // Profile elements - fallback selectors
    this.profileName = page.locator('#profileName, .profile-name');
    this.profileEmail = page.locator('#profileEmail, .profile-email');
    this.loyaltyPoints = page.locator('#loyaltyPoints, .loyalty-points');
    this.editProfileBtn = page.locator('#editProfile, .edit-profile-btn');
    this.viewOrdersBtn = page.locator('#viewOrders, .view-orders-btn');
    this.viewTicketsBtn = page.locator('#viewTickets, .view-tickets-btn');
    
    // Additional merchandise elements
    this.browseMerchandiseBtn = page.locator('a[href="merchandise.html"]');
    
    // Notification
    this.notification = page.locator('[data-notification="true"], .notification, .alert').last();
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(email = 'test@example.com', password = 'password123') {
    await this.loginBtn.click();
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.submitLogin.click();
  }

  async register(userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '+60123456789',
    address: '123 Test Street, Kuching, Sarawak'
  }) {
    await this.registerBtn.click();
    await this.registerName.fill(userData.name);
    await this.registerEmail.fill(userData.email);
    await this.registerPassword.fill(userData.password);
    await this.registerPhone.fill(userData.phone);
    await this.registerAddress.fill(userData.address);
    await this.submitRegister.click();
  }
  async searchTickets(searchData = {
    origin: 'kuching-sentral',
    destination: 'satok',
    date: '2025-06-15'
  }) {
    await this.originSelect.selectOption(searchData.origin);
    await this.destinationSelect.selectOption(searchData.destination);
    await this.departureDate.fill(searchData.date);
    await this.searchBtn.click();
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

test.describe('Kuching ART Online System - Homepage and Navigation', () => {  test('should load homepage successfully', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    // Check if the main elements are visible
    await expect(page.locator('h1')).toContainText('Kuching ART');
    await expect(page.getByRole('heading', { name: /Welcome to Kuching.*Rapid Transit/ })).toBeVisible();
    await expect(artPage.bookTicketBtn).toBeVisible();
    await expect(artPage.viewSchedulesBtn).toBeVisible();
  });
  test('should navigate between sections', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    // Test navigation to routes section
    await artPage.navRoutes.click();
    // Wait for routes section to be visible instead of checking active class
    await expect(page.locator('#routes')).toBeVisible();
    
    // Test navigation to schedules section
    await artPage.navSchedules.click();
    await expect(page.locator('#schedules')).toBeVisible();

    // Test navigation to fares section
    await artPage.navFares.click();
    await expect(page.locator('#fares')).toBeVisible();
  });
  test('should use hero buttons for navigation', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Test book ticket button - use more specific selector to avoid strict mode violation
    await page.locator('.hero-buttons a[href="booking.html"]').click();
    // Should navigate to booking page
    await expect(page).toHaveURL(/booking\.html/);
    
    // Navigate back to homepage
    await page.goto('http://localhost:3000/');

    // Test view schedules button
    await artPage.viewSchedulesBtn.click();
    // Should scroll to schedules section
    await expect(page.locator('#schedules')).toBeVisible();
  });
});
