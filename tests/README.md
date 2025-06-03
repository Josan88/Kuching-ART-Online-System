# Kuching ART Online System - Demo Tests (Updated)

This directory contains comprehensive demo tests for the Kuching ART Online System, showcasing all major functionalities through automated end-to-end scenarios. The tests have been refactored and consolidated into a single working implementation.

## 🎯 Demo Scenarios Covered

### 1. User Register and Log in
- **File**: `integrated-demo.test.js` - Scenario 1
- **Coverage**: Complete user registration flow, email validation, login authentication, profile verification
- **Key Features**: Form validation, password security, user session management

### 2. Buy a Ticket and Make a Payment
- **File**: `integrated-demo.test.js` - Scenario 2
- **Coverage**: Route search, ticket selection, payment processing, booking confirmation
- **Key Features**: Route filtering, real-time pricing, secure payment gateway, booking reference generation

### 3. Cancel Trip and Get Refund
- **File**: `integrated-demo.test.js` - Scenario 3
- **Coverage**: Booking management, cancellation workflow, refund processing
- **Key Features**: Booking lookup, cancellation policies, automated refund calculation

### 4. Admin Generates Usage Statistics
- **File**: `integrated-demo.test.js` - Scenario 4
- **Coverage**: Admin dashboard, data analytics, report generation, statistics visualization
- **Key Features**: Date range selection, comprehensive metrics, export functionality

### 5. User Submit Feedback
- **File**: `integrated-demo.test.js` - Scenario 5
- **Coverage**: Feedback form, rating system, submission confirmation, follow-up process
- **Key Features**: Multiple feedback categories, star ratings, message validation

### 6. Merchandise Shopping
- **File**: `integrated-demo.test.js` - Scenario 6
- **Coverage**: Product catalog, shopping cart, e-commerce checkout, order management
- **Key Features**: Category filtering, inventory management, shopping cart persistence

## 🚀 Running the Demo Tests

### Prerequisites
```powershell
# Install dependencies
npm install

# Ensure Playwright browsers are installed
npx playwright install
```

### Demo Commands

#### Complete Demo Suite
```powershell
# Run all demo scenarios with browser visible
npx playwright test tests/integrated-demo.test.js --project="Microsoft Edge" --headed

# Run complete system demo (all scenarios in sequence)
npx playwright test tests/integrated-demo.test.js --grep="six core scenarios" --project="Microsoft Edge" --headed

# Run individual scenario demos (replace n with 1-6)
npx playwright test tests/integrated-demo.test.js --grep="Scenario n" --project="Microsoft Edge" --headed
```

#### Quick Demo Tests
```powershell
# Run demos without browser (headless)
npx playwright test tests/integrated-demo.test.js --project="Microsoft Edge"

# Run specific scenario headless (replace n with 1-6)
npx playwright test tests/integrated-demo.test.js --grep="Scenario n" --project="Microsoft Edge"
```

#### Demo Reports
```powershell
# Run demos and generate HTML report
npx playwright test tests/integrated-demo.test.js --reporter=html

# View existing demo report
npx playwright show-report
```

## 📁 Demo Test Files

### `integrated-demo.test.js`
**Main demo test suite containing:**
- Complete implementation of all six core scenarios
- Individual scenario demos (Scenario 1-6)
- Complete end-to-end system demo combining all scenarios
- Component tests for page structure and navigation
- Uses Page Object Model design pattern for maintainability

### `demo-scenarios.test.js` *(Reference Only)*
**Simplified reference file:**
- Points users to the integrated-demo.test.js implementation
- Preserved for backwards compatibility
- Original implementation backed up in demo-scenarios.test.js.bak

### `demo-runner.test.js` *(Reference Only)*
**Simplified reference file:**
- Points users to the integrated-demo.test.js implementation
- Preserved for backwards compatibility
- Original implementation backed up in demo-runner.test.js.bak

### `demo-config.js`
**Configuration and test data:**
- Demo user credentials
- Sample routes and merchandise
- Payment test data
- Helper functions for test data generation

## 🎬 Demo Test Features

### Page Object Model Design
- Clean separation of test logic and page interactions
- Encapsulated element selectors and interaction methods
- Improved maintainability and readability
- Simplified test writing with reusable page methods

### Realistic Test Data
- Dynamically generated user accounts with timestamps
- Realistic route information for transportation system
- Sample merchandise inventory with product categories
- Valid payment card test data for checkout flow

### Comprehensive Logging
- Step-by-step execution logging with progress indicators
- Clear success/failure messages for each scenario step
- Graceful error handling with recovery mechanisms
- Detailed console output for troubleshooting

### Browser Automation
- Visual demonstration with headed browser mode
- Microsoft Edge as the primary test browser
- Responsive design testing with multiple viewport sizes
- Screenshots and videos captured automatically on test completion

## 📊 Demo Scenarios Breakdown

### Scenario 1: User Registration & Login
```javascript
// Creates new user account with timestamp for uniqueness
const timestamp = Date.now();
const demoUser = {
  name: `Demo User ${timestamp}`,
  email: `demo.user.${timestamp}@example.com`,
  password: 'DemoPass123!',
  phone: '+60123456789',
  address: '123 Demo Street, Kuching, Sarawak'
};

// Complete registration flow
await demoPage.register(demoUser);
// Login with new credentials
await demoPage.login(demoUser.email, demoUser.password);
```

### Scenario 2: Ticket Booking & Payment
```javascript
// Books ticket with payment
await demoPage.navigateToSection('routes');
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);
const dateString = futureDate.toISOString().split('T')[0];

await demoPage.origin.selectOption('Kuching Central');
await demoPage.destination.selectOption('Kuching Airport');
await demoPage.departureDate.fill(dateString);
await demoPage.departureTime.selectOption('10:00');
await demoPage.ticketType.selectOption('standard');

// Submit booking
await demoPage.ticketBookingForm.locator('button[type="submit"]').click();
```

### Scenario 3: Trip Cancellation & Refund
```javascript
// Navigate to user bookings
await demoPage.navigateToSection('profile');

// View existing bookings (implementation specific)
// This approach uses standard HTML selectors instead of data-testid attributes
await page.locator('.booking-item').first().click();
await page.locator('.cancel-button').click();
await page.locator('#cancellationForm').fill({
  reason: 'Change of plans'
});
await page.locator('#confirmCancellation').click();
```

### Scenario 4: Admin Statistics
```javascript
// Login as admin
await demoPage.login('admin@example.com', 'admin123');

// Navigate to admin section
await demoPage.navigateToSection('admin');

// Generate statistics report with date range
await page.locator('#dateFrom').fill('2025-05-01');
await page.locator('#dateTo').fill('2025-06-01');
await page.selectOption('#reportType', 'comprehensive');
await page.click('#generateReport');
```

### Scenario 5: User Feedback
```javascript
// Navigate to feedback section
await demoPage.navigateToSection('feedback');

// Submit user feedback
await page.locator('#feedbackSubject').fill('Excellent Service Experience');
await page.locator('#feedbackType').selectOption('service-quality');
await page.locator('.rating-star').nth(4).click(); // 5-star rating
await page.locator('#feedbackMessage').fill('The service was outstanding...');
await page.locator('#feedbackForm').locator('button[type="submit"]').click();
```

### Scenario 6: Merchandise Shopping
```javascript
// Navigate to merchandise section
await demoPage.navigateToSection('merchandise');

// Filter and add items to cart
await demoPage.searchInput.fill('souvenir');
await demoPage.categoryFilter.selectOption('all');

// Add items to cart
await page.locator('.merchandise-item').first().locator('.add-to-cart').click();
await page.locator('.merchandise-item').nth(1).locator('.add-to-cart').click();

// Check cart status
const cartStatus = await demoPage.checkCartStatus();
console.log(`Cart: ${cartStatus.count} items, RM ${cartStatus.total}`);
```

## 🔧 Customizing Demo Tests

### Adding New Demo Scenarios
1. Create new test in `integrated-demo.test.js`
2. Add test data to `demo-config.js` if needed
3. Follow the Page Object Model pattern for maintainability
4. Document in this README

### Modifying Test Data
Edit `demo-config.js` to customize:
- User credentials
- Route information
- Merchandise items
- Payment details
- Timing configurations

### Performance Testing
Adjust concurrent user simulation in `demo-runner.test.js`:
```javascript
// Increase loop count for load testing
for (let i = 1; i <= 10; i++) {
  // Simulate user actions
}
```

## 📈 Demo Test Reports

### HTML Reports
Generated reports include:
- Test execution timeline
- Screenshots of each step
- Success/failure indicators
- Performance metrics
- Error details with stack traces

### Console Output
Real-time logging shows:
```
=== Demo 1: User Registration and Login ===
Step 1: Registering new user...
✓ User registration completed successfully
Step 2: Logging in with new credentials...
✓ User login completed successfully
=== Demo 1 Completed Successfully ===
```

## 🔄 Implementation Update Notes

### Transition from Previous Implementation
The demo tests have been refactored from the original separated files (`demo-scenarios.test.js` and `demo-runner.test.js`) into a consolidated implementation in `integrated-demo.test.js`. This change was made to improve reliability, maintenance, and execution success rate.

### Key Improvements
- **Standard HTML Selectors:** Replaced data-testid attributes with standard HTML selectors for better reliability
- **Enhanced Error Handling:** Added graceful error recovery for UI interactions
- **Consolidated Test Logic:** Combined all scenario tests in a single file with shared Page Object Model
- **Improved Documentation:** Added detailed console logs for each test step
- **Backward Compatibility:** Preserved original file names as reference files pointing to the new implementation

### Reference Documentation
For more detailed information about the current implementation, please refer to:
- [DEMO_UPDATED.md](/docs/DEMO_UPDATED.md) - Comprehensive documentation about current implementation
- [QUICK_DEMO_GUIDE_UPDATED.md](/docs/QUICK_DEMO_GUIDE_UPDATED.md) - Updated commands for running demos

### Backup Information
The original implementations have been backed up:
- Original demo-scenarios.test.js → demo-scenarios.test.js.bak
- Original demo-runner.test.js → demo-runner.test.js.bak

## 🔍 Troubleshooting

### Common Issues
1. **Element not found errors**
   * **Problem**: `Error: locator.click: Target element ... not found`
   * **Solution**: Check that the selector is correct and the element is visible. The integrated demo uses standard HTML selectors which are more reliable than data-testid attributes.

2. **Timing issues**
   * **Problem**: Test runs too fast for UI to respond
   * **Solution**: Use proper wait conditions with `await expect(element).toBeVisible()` rather than arbitrary timeouts.

3. **Test failures in headless mode**
   * **Problem**: Tests pass in headed mode but fail headless
   * **Solution**: Run with `--debug` flag to see what's happening and adjust selectors or add more robust wait conditions.

4. **Notifications overlapping elements**
   * **Problem**: Click actions fail because notifications cover buttons
   * **Solution**: The integrated tests include notification handling - wait for notifications to disappear before proceeding.

### Getting Help
If you encounter issues not covered here:
1. Check the console logs for detailed error messages
2. Review the HTML report for screenshots at point of failure
3. Try running individual tests with `--debug` flag for step-by-step execution
4. Refer to [DEMO_UPDATED.md](/docs/DEMO_UPDATED.md) for additional troubleshooting tips

**Demo tests fail to start:**
```powershell
# Ensure server is running
npm run serve

# Check if port 3000 is available
netstat -an | findstr :3000
```

**Browser doesn't open in headed mode:**
```powershell
# Reinstall Playwright browsers
npx playwright install --force
```

**Tests timeout:**
- Increase timeout in `playwright.config.js`
- Check system performance
- Verify network connectivity

### Debug Mode
```powershell
# Run specific demo in debug mode
npx playwright test tests/demo-scenarios.test.js --grep "Demo 1" --debug
```

## 📝 Best Practices

### Running Demos for Presentations
1. Use `npm run demo` for visible browser execution
2. Maximize browser window for better visibility
3. Close unnecessary applications to improve performance
4. Use `--grep` to run specific scenarios

### Demo Environment Setup
1. Ensure clean test data state
2. Verify all services are running
3. Check browser compatibility
4. Prepare backup slides in case of technical issues

### Maintenance
- Regularly update test data
- Keep demo scenarios synchronized with application changes
- Review and update documentation
- Monitor test execution performance

## 🚨 Important Notes

- **Test Data**: All demo data is for testing purposes only
- **Payment Cards**: Uses test card numbers, not real payment processing
- **User Accounts**: Demo accounts are temporary and reset between runs
- **Performance**: Demo timing may vary based on system performance
- **Browser Support**: Optimized for Chrome, Firefox, and Edge browsers

---

For additional help or questions about the demo tests, please refer to the main project documentation or contact the development team.
