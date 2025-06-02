// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Page Object Model for Ticket Booking
 */
class KuchingARTPage {
  constructor(page) {
    this.page = page;
    
    // Navigation
    this.navRoutes = page.getByTestId('nav-routes');
    
    // Auth elements
    this.loginBtn = page.getByTestId('login-btn');
    this.loginEmail = page.getByTestId('login-email');
    this.loginPassword = page.getByTestId('login-password');
    this.submitLogin = page.getByTestId('submit-login');
    this.userName = page.getByTestId('user-name');
    
    // Ticket booking elements
    this.originSelect = page.getByTestId('origin-select');
    this.destinationSelect = page.getByTestId('destination-select');
    this.departureDate = page.getByTestId('departure-date');
    this.departureTime = page.getByTestId('departure-time');
    this.ticketType = page.getByTestId('ticket-type');
    this.searchRoutesBtn = page.getByTestId('search-routes-btn');
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

  async waitForNotification(expectedText) {
    await expect(this.notification).toBeVisible();
    await expect(this.notification).toContainText(expectedText);
  }
}

test.describe('Ticket Booking System', () => {
  test('should display ticket booking form', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Check if all form elements are visible
    await expect(artPage.originSelect).toBeVisible();
    await expect(artPage.destinationSelect).toBeVisible();
    await expect(artPage.departureDate).toBeVisible();
    await expect(artPage.departureTime).toBeVisible();
    await expect(artPage.ticketType).toBeVisible();
    await expect(artPage.searchRoutesBtn).toBeVisible();
  });

  test('should have correct route options', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Check origin options
    const originOptions = await artPage.originSelect.locator('option').allTextContents();
    expect(originOptions).toContain('Kuching Central');
    expect(originOptions).toContain('Padungan');
    expect(originOptions).toContain('Pending');
    expect(originOptions).toContain('Tabuan Jaya');
    
    // Check destination options
    const destinationOptions = await artPage.destinationSelect.locator('option').allTextContents();
    expect(destinationOptions).toContain('Kuching Central');
    expect(destinationOptions).toContain('Padungan');
    expect(destinationOptions).toContain('Pending');
    expect(destinationOptions).toContain('Tabuan Jaya');
  });

  test('should have correct time and ticket type options', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Check time options
    const timeOptions = await artPage.departureTime.locator('option').allTextContents();
    expect(timeOptions).toContain('08:00 AM');
    expect(timeOptions).toContain('10:00 AM');
    expect(timeOptions).toContain('12:00 PM');
    expect(timeOptions).toContain('02:00 PM');
    expect(timeOptions).toContain('04:00 PM');
    expect(timeOptions).toContain('06:00 PM');
    
    // Check ticket type options
    const ticketOptions = await artPage.ticketType.locator('option').allTextContents();
    expect(ticketOptions).toContain('Standard - RM 3.00');
    expect(ticketOptions).toContain('Premium - RM 5.00');
    expect(ticketOptions).toContain('VIP - RM 8.00');
  });

  test('should validate form submission with missing fields', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Try to submit without filling any fields
    await artPage.searchRoutesBtn.click();
    
    // Form should not submit due to HTML5 validation
    await expect(page.locator('#routeResults')).toBeHidden();
  });

  test('should show error when origin and destination are the same', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Fill form with same origin and destination
    await artPage.searchTickets({
      origin: 'kuching-central',
      destination: 'kuching-central',
      date: '2025-06-15',
      time: '10:00',
      type: 'standard'
    });
    
    await artPage.waitForNotification('Origin and destination cannot be the same');
    await expect(page.locator('#routeResults')).toBeHidden();
  });

  test('should successfully search for routes with valid data', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Fill form with valid data
    await artPage.searchTickets({
      origin: 'kuching-central',
      destination: 'padungan',
      date: '2025-06-15',
      time: '10:00',
      type: 'standard'
    });
    
    await artPage.waitForNotification('Routes found!');
    
    // Check if route results are displayed
    await expect(page.locator('#routeResults')).toBeVisible();
    await expect(page.locator('.route-item')).toBeVisible();
    
    // Check if route details are displayed
    await expect(page.locator('.route-item')).toContainText('kuching-central → padungan');
    await expect(page.locator('.route-item')).toContainText('Duration: 25 minutes');
    await expect(page.locator('.route-item')).toContainText('RM 3.00');
  });

  test('should display correct prices for different ticket types', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Test Standard ticket
    await artPage.searchTickets({
      origin: 'kuching-central',
      destination: 'padungan',
      date: '2025-06-15',
      time: '10:00',
      type: 'standard'
    });
    await expect(page.locator('.route-item')).toContainText('RM 3.00');
    
    // Test Premium ticket
    await artPage.searchTickets({
      origin: 'kuching-central',
      destination: 'padungan',
      date: '2025-06-15',
      time: '10:00',
      type: 'premium'
    });
    await expect(page.locator('.route-item')).toContainText('RM 5.00');
    
    // Test VIP ticket
    await artPage.searchTickets({
      origin: 'kuching-central',
      destination: 'padungan',
      date: '2025-06-15',
      time: '10:00',
      type: 'vip'
    });
    await expect(page.locator('.route-item')).toContainText('RM 8.00');
  });

  test('should require login for ticket booking', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Search for routes
    await artPage.searchTickets();
    await artPage.waitForNotification('Routes found!');
    
    // Try to book without login
    const bookButton = page.getByTestId('book-ticket-1');
    await bookButton.click();
    
    await artPage.waitForNotification('Please login to book tickets');
    
    // Check if login modal appears
    await expect(page.locator('#loginModal')).toHaveClass(/active/);
  });

  test('should successfully book ticket when logged in', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    // Login first
    await artPage.login();
    await artPage.waitForNotification('Login successful!');
    
    await artPage.navRoutes.click();
    
    // Search for routes
    await artPage.searchTickets();
    await artPage.waitForNotification('Routes found!');
    
    // Book the ticket
    const bookButton = page.getByTestId('book-ticket-1');
    await bookButton.click();
    
    await artPage.waitForNotification('Ticket booked successfully!');
  });

  test('should handle multiple route searches', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // First search
    await artPage.searchTickets({
      origin: 'kuching-central',
      destination: 'padungan',
      date: '2025-06-15',
      time: '10:00',
      type: 'standard'
    });
    await artPage.waitForNotification('Routes found!');
    await expect(page.locator('.route-item')).toContainText('RM 3.00');
    
    // Second search with different parameters
    await artPage.searchTickets({
      origin: 'pending',
      destination: 'tabuan-jaya',
      date: '2025-06-16',
      time: '14:00',
      type: 'premium'
    });
    await artPage.waitForNotification('Routes found!');
    await expect(page.locator('.route-item')).toContainText('RM 5.00');
  });

  test('should validate date input (future dates only)', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Check if date input has minimum date set to today
    const minDate = await artPage.departureDate.getAttribute('min');
    const today = new Date().toISOString().split('T')[0];
    expect(minDate).toBe(today);
    
    // Check if default value is today
    const currentValue = await artPage.departureDate.inputValue();
    expect(currentValue).toBe(today);
  });

  test('should display route duration and arrival time correctly', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();
    
    await artPage.navRoutes.click();
    
    // Search with 10:00 departure time
    await artPage.searchTickets({
      origin: 'kuching-central',
      destination: 'padungan',
      date: '2025-06-15',
      time: '10:00',
      type: 'standard'
    });
    
    await artPage.waitForNotification('Routes found!');
    
    // Check if correct duration and arrival time are displayed
    await expect(page.locator('.route-item')).toContainText('Duration: 25 minutes');
    await expect(page.locator('.route-item')).toContainText('Departure: 10:00');
    await expect(page.locator('.route-item')).toContainText('Arrival: 10:25');
  });
});
