// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Import the Page Object Model
 */
class KuchingARTPage {
  constructor(page) {
    this.page = page;
    
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
    
    // Profile elements
    this.navProfile = page.getByTestId('nav-profile');
    this.profileName = page.getByTestId('profile-name');
    this.profileEmail = page.getByTestId('profile-email');
    this.loyaltyPoints = page.getByTestId('loyalty-points');
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

  async waitForNotification(expectedText) {
    await expect(this.notification).toBeVisible();
    await expect(this.notification).toContainText(expectedText);
  }
}

test.describe('Authentication System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and sessionStorage before each test
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should show login modal when clicking login button', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    await artPage.loginBtn.click();
    
    // Check if login modal is visible
    await expect(page.locator('#loginModal')).toHaveClass(/active/);
    await expect(artPage.loginEmail).toBeVisible();
    await expect(artPage.loginPassword).toBeVisible();
    await expect(artPage.submitLogin).toBeVisible();
  });

  test('should close login modal when clicking close button', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    await artPage.loginBtn.click();
    await expect(page.locator('#loginModal')).toHaveClass(/active/);
    
    await artPage.closeLoginModal.click();
    await expect(page.locator('#loginModal')).not.toHaveClass(/active/);
  });

  test('should show register modal when clicking register button', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    await artPage.registerBtn.click();
    
    // Check if register modal is visible
    await expect(page.locator('#registerModal')).toHaveClass(/active/);
    await expect(artPage.registerName).toBeVisible();
    await expect(artPage.registerEmail).toBeVisible();
    await expect(artPage.registerPassword).toBeVisible();
    await expect(artPage.registerPhone).toBeVisible();
    await expect(artPage.registerAddress).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    await artPage.login('test@example.com', 'password123');
    
    // Wait for login success notification
    await artPage.waitForNotification('Login successful!');
    
    // Check if UI updates after login
    await expect(artPage.loginBtn).toBeHidden();
    await expect(artPage.registerBtn).toBeHidden();
    await expect(artPage.userName).toBeVisible();
    await expect(artPage.userName).toContainText('John Doe');
    await expect(artPage.logoutBtn).toBeVisible();
  });

  test('should show error for incomplete login credentials', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    await artPage.loginBtn.click();
    await artPage.loginEmail.fill('test@example.com');
    // Don't fill password
    await artPage.submitLogin.click();
    
    // The form should not submit (HTML5 validation)
    await expect(page.locator('#loginModal')).toHaveClass(/active/);
  });

  test('should successfully register new user', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    const userData = {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'securepassword123',
      phone: '+60198765432',
      address: '456 New Street, Kuching, Sarawak'
    };

    await artPage.register(userData);
    
    // Wait for registration success notification
    await artPage.waitForNotification('Registration successful!');
    
    // Check if UI updates after registration
    await expect(artPage.loginBtn).toBeHidden();
    await expect(artPage.registerBtn).toBeHidden();
    await expect(artPage.userName).toBeVisible();
    await expect(artPage.userName).toContainText(userData.name);
  });

  test('should show error for incomplete registration', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    await artPage.registerBtn.click();
    await artPage.registerName.fill('John Doe');
    await artPage.registerEmail.fill('john@example.com');
    // Don't fill other required fields
    await artPage.submitRegister.click();
    
    // The form should not submit due to required field validation
    await expect(page.locator('#registerModal')).toHaveClass(/active/);
  });

  test('should successfully logout', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // First login
    await artPage.login();
    await artPage.waitForNotification('Login successful!');
    
    // Then logout
    await artPage.logoutBtn.click();
    await artPage.waitForNotification('Logged out successfully');
    
    // Check if UI updates after logout
    await expect(artPage.loginBtn).toBeVisible();
    await expect(artPage.registerBtn).toBeVisible();
    await expect(artPage.userName).toBeHidden();
    await expect(artPage.logoutBtn).toBeHidden();
  });

  test('should display user profile information after login', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // Login first
    await artPage.login();
    await artPage.waitForNotification('Login successful!');
    
    // Navigate to profile
    await artPage.navProfile.click();
    
    // Check if profile information is displayed
    await expect(artPage.profileName).toContainText('John Doe');
    await expect(artPage.profileEmail).toContainText('test@example.com');
    await expect(artPage.loyaltyPoints).toContainText('150');
  });

  test('should handle multiple login attempts', async ({ page }) => {
    const artPage = new KuchingARTPage(page);
    await artPage.goto();

    // First login
    await artPage.login('user1@example.com', 'password1');
    await artPage.waitForNotification('Login successful!');
    
    // Logout
    await artPage.logoutBtn.click();
    await artPage.waitForNotification('Logged out successfully');
    
    // Second login with different credentials
    await artPage.login('user2@example.com', 'password2');
    await artPage.waitForNotification('Login successful!');
    
    // Verify the UI shows logged in state
    await expect(artPage.userName).toBeVisible();
    await expect(artPage.logoutBtn).toBeVisible();
  });
});
