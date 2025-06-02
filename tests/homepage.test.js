// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Page Object Model for Kuching ART System
 * This encapsulates page interactions for better maintainability
 */
class KuchingARTPage {
  constructor(page) {
    this.page = page;
    
    // Navigation elements
    this.navHome = page.getByTestId('nav-home');
    this.navRoutes = page.getByTestId('nav-routes');
    this.navMerchandise = page.getByTestId('nav-merchandise');
    this.navProfile = page.getByTestId('nav-profile');
    
    // Auth elements
    this.loginBtn = page.getByTestId('login-btn');
    this.registerBtn = page.getByTestId('register-btn');
    this.logoutBtn = page.getByTestId('logout-btn');
    this.userName = page.getByTestId('user-name');
    
    // Login modal elements
    this.loginEmail = page.getByTestId('login-email');
    this.loginPassword = page.getByTestId('login-password');
    this.submitLogin = page.getByTestId('submit-login');
    this.closeLoginModal = page.getByTestId('close-login-modal');
    
    // Register modal elements
    this.registerName = page.getByTestId('register-name');
    this.registerEmail = page.getByTestId('register-email');
    this.registerPassword = page.getByTestId('register-password');
    this.registerPhone = page.getByTestId('register-phone');
    this.registerAddress = page.getByTestId('register-address');
    this.submitRegister = page.getByTestId('submit-register');
    this.closeRegisterModal = page.getByTestId('close-register-modal');
    
    // Hero section elements
    this.bookTicketBtn = page.getByTestId('book-ticket-btn');
    this.browseMerchandiseBtn = page.getByTestId('browse-merchandise-btn');
    
    // Ticket booking elements
    this.originSelect = page.getByTestId('origin-select');
    this.destinationSelect = page.getByTestId('destination-select');
    this.departureDate = page.getByTestId('departure-date');
    this.departureTime = page.getByTestId('departure-time');
    this.ticketType = page.getByTestId('ticket-type');
    this.searchRoutesBtn = page.getByTestId('search-routes-btn');
    
    // Merchandise elements
    this.categoryFilter = page.getByTestId('category-filter');
    this.searchInput = page.getByTestId('search-input');
    this.cartCount = page.getByTestId('cart-count');
    this.cartTotal = page.getByTestId('cart-total');
    this.checkoutBtn = page.getByTestId('checkout-btn');
    
    // Profile elements
    this.profileName = page.getByTestId('profile-name');
    this.profileEmail = page.getByTestId('profile-email');
    this.loyaltyPoints = page.getByTestId('loyalty-points');
    this.editProfileBtn = page.getByTestId('edit-profile-btn');
    this.viewOrdersBtn = page.getByTestId('view-orders-btn');
    this.viewTicketsBtn = page.getByTestId('view-tickets-btn');
      // Notification
    this.notification = page.locator('[data-notification="true"]').last();
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

test.describe('Kuching ART Online System - Homepage and Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();    // Check if the main elements are visible
    await expect(page.locator('h1')).toContainText('Kuching ART');
    await expect(page.getByRole('heading', { name: 'Welcome to Kuching ART Online System' })).toBeVisible();
    await expect(artPage.bookTicketBtn).toBeVisible();
    await expect(artPage.browseMerchandiseBtn).toBeVisible();
  });

  test('should navigate between sections', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();    // Test navigation to routes section
    await artPage.navRoutes.click();
    await expect(page.locator('#routes')).toHaveClass(/active/);
    await expect(page.getByRole('heading', { name: 'Book Your Ticket' })).toBeVisible();

    // Test navigation to merchandise section
    await artPage.navMerchandise.click();
    await expect(page.locator('#merchandise')).toHaveClass(/active/);
    await expect(page.getByRole('heading', { name: 'Merchandise Store' })).toBeVisible();

    // Test navigation back to home
    await artPage.navHome.click();
    await expect(page.locator('#home')).toHaveClass(/active/);
  });

  test('should use hero buttons for navigation', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Test book ticket button
    await artPage.bookTicketBtn.click();
    await expect(page.locator('#routes')).toHaveClass(/active/);

    // Navigate back to home
    await artPage.navHome.click();

    // Test browse merchandise button
    await artPage.browseMerchandiseBtn.click();
    await expect(page.locator('#merchandise')).toHaveClass(/active/);
  });
});
