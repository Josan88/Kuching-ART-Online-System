# 📸 Evidence Capture Guide
## Screenshots and Video Documentation for Kuching ART Online System

---

## 🎬 Automated Video Demonstration

### Complete System Demo (Recommended)
```powershell
# Run all 6 scenarios with video recording
npx playwright test tests/integrated-demo.test.js --grep="six core scenarios" --project="Microsoft Edge" --headed
```

**This command will:**
- Open Microsoft Edge browser in headed mode (visible)
- Execute all 6 core scenarios in sequence
- Record video of entire demonstration
- Generate screenshot evidence at key interaction points
- Save results in `test-results/` directory

### Individual Scenario Videos
```powershell
# Scenario 1: User Registration and Login
npx playwright test tests/integrated-demo.test.js --grep="Scenario 1" --project="Microsoft Edge" --headed

# Scenario 2: Ticket Booking and Payment
npx playwright test tests/integrated-demo.test.js --grep="Scenario 2" --project="Microsoft Edge" --headed

# Scenario 3: Trip Cancellation and Refund
npx playwright test tests/integrated-demo.test.js --grep="Scenario 3" --project="Microsoft Edge" --headed

# Scenario 4: Admin Statistics Dashboard
npx playwright test tests/integrated-demo.test.js --grep="Scenario 4" --project="Microsoft Edge" --headed

# Scenario 5: User Feedback Submission
npx playwright test tests/integrated-demo.test.js --grep="Scenario 5" --project="Microsoft Edge" --headed

# Scenario 6: Merchandise E-commerce
npx playwright test tests/integrated-demo.test.js --grep="Scenario 6" --project="Microsoft Edge" --headed
```

---

## 📊 Evidence Generated

### 🎥 Video Files
After running tests, check `test-results/` directory for:
- **`integrated-demo-Kuching-AR-*/video.webm`** - Complete demo video
- Individual scenario videos for each test run
- High-quality screen recordings showing all interactions

### 📸 Screenshot Files
- **Home screen** - Clean starting interface
- **Form interactions** - Input validation and error handling
- **Success confirmations** - Completed transactions
- **Admin dashboard** - Statistics and management interface
- **Error states** - Input validation demonstrations

### 📋 Test Reports
- **HTML Report:** `playwright-report/index.html`
- **JSON Results:** `test-results/results.json`
- **XML Results:** `test-results/results.xml`

---

## 🖼️ Manual Screenshot Checklist

### Home Screen Evidence (1 point)
**Capture:** Clean homepage showing navigation and hero section
- ✅ Kuching ART branding and logo
- ✅ Navigation menu (Home, Schedules, Routes, etc.)
- ✅ Hero section with "Book a Ticket" and "View Schedules" buttons
- ✅ Service feature cards
- ✅ Footer with contact information

**File:** `evidence-screenshots/01-home-screen.png`

### Scenario 1: User Registration & Login (2.25 points)
**Screenshots needed:**
1. **Empty registration form** - `01-registration-empty.png`
2. **Registration form with valid input** - `01-registration-input.png`
3. **Registration validation errors** - `01-registration-errors.png`
4. **Successful registration confirmation** - `01-registration-success.png`
5. **Login form with credentials** - `01-login-input.png`
6. **Successful login state** - `01-login-success.png`

### Scenario 2: Ticket Booking & Payment (2.25 points)
**Screenshots needed:**
1. **Empty booking form** - `02-booking-empty.png`
2. **Booking form with route selection** - `02-booking-input.png`
3. **Date/time validation errors** - `02-booking-errors.png`
4. **Booking summary/review** - `02-booking-review.png`
5. **Payment processing** - `02-payment-process.png`
6. **Booking confirmation** - `02-booking-success.png`

### Scenario 3: Trip Cancellation & Refund (2.25 points)
**Screenshots needed:**
1. **Manage bookings page** - `03-manage-empty.png`
2. **Booking selection for cancellation** - `03-cancel-input.png`
3. **Cancellation policy validation** - `03-cancel-validation.png`
4. **Cancellation confirmation dialog** - `03-cancel-confirm.png`
5. **Refund processing** - `03-refund-process.png`
6. **Cancellation success** - `03-cancel-success.png`

### Scenario 4: Admin Statistics (2.25 points)
**Screenshots needed:**
1. **Admin login page** - `04-admin-login.png`
2. **Admin credentials input** - `04-admin-input.png`
3. **Admin authentication validation** - `04-admin-validation.png`
4. **Empty dashboard loading** - `04-dashboard-loading.png`
5. **Complete statistics dashboard** - `04-dashboard-complete.png`
6. **Report generation** - `04-reports-generated.png`

### Scenario 5: User Feedback (2.25 points)
**Screenshots needed:**
1. **Empty feedback form** - `05-feedback-empty.png`
2. **Feedback form with input** - `05-feedback-input.png`
3. **Rating and category selection** - `05-feedback-rating.png`
4. **Feedback validation errors** - `05-feedback-errors.png`
5. **Feedback submission processing** - `05-feedback-process.png`
6. **Feedback confirmation** - `05-feedback-success.png`

### Scenario 6: Merchandise E-commerce (2.25 points)
**Screenshots needed:**
1. **Product catalog empty/loading** - `06-catalog-empty.png`
2. **Product browsing and selection** - `06-product-browse.png`
3. **Shopping cart with items** - `06-cart-items.png`
4. **Checkout form validation** - `06-checkout-validation.png`
5. **Order processing** - `06-order-process.png`
6. **Purchase confirmation** - `06-purchase-success.png`

### Application Exit/Reset (5 points across scenarios)
**Screenshots needed:**
1. **Session logout** - `07-logout.png`
2. **Application reset state** - `07-reset-state.png`
3. **Browser close confirmation** - `07-browser-close.png`
4. **Clean restart demonstration** - `07-clean-restart.png`

---

## 🚀 Quick Evidence Generation Commands

### Complete Evidence Package
```powershell
# 1. Start the application
npm start

# 2. Run automated tests with video recording
npx playwright test tests/integrated-demo.test.js --project="Microsoft Edge" --headed

# 3. Generate HTML report
npx playwright show-report

# 4. Open report in browser (automatic)
```

### Manual Testing Session
```powershell
# Start local server
npm start

# Open browser to http://localhost:3000
# Navigate through each scenario manually
# Use browser's screenshot tool (F12 -> Device toolbar -> Screenshot)
# Or use Snipping Tool (Windows Key + Shift + S)
```

---

## 📁 Evidence Organization

### Directory Structure
```
docs/
├── EVIDENCE_OF_CORRECT_EXECUTION.md     # This document
├── evidence-screenshots/                # Manual screenshots
│   ├── 01-home-screen.png
│   ├── 01-registration-empty.png
│   ├── 01-registration-input.png
│   └── ... (all scenario screenshots)
├── playwright-report/                   # Automated test reports
│   ├── index.html                      # Main report
│   └── data/                           # Test artifacts
└── test-results/                       # Test execution results
    ├── video.webm                      # Demo videos
    ├── results.json                    # JSON test results
    └── results.xml                     # XML test results
```

---

## 🎯 Grading Criteria Mapping

### Points Distribution (25 points total)
- **Home screen illustration:** 1 point ✅
- **Successful data input:** 9 points ✅ (1.5 points × 6 scenarios)
- **Input validation and processing:** 5 points ✅ (0.83 points × 6 scenarios)
- **Sample outputs illustration:** 5 points ✅ (0.83 points × 6 scenarios)
- **Exit and test screens:** 5 points ✅ (0.83 points × 6 scenarios)

### Evidence Quality Standards
- **Clear Screenshots:** High resolution, readable text
- **Complete Workflows:** All steps documented
- **Error Demonstrations:** Validation and error handling shown
- **Success Confirmations:** Completion states captured
- **Professional Presentation:** Organized and labeled evidence

---

## ⚡ Quick Start for Evidence Collection

1. **Install dependencies** (if not done):
   ```powershell
   npm install
   npx playwright install msedge
   ```

2. **Generate all evidence**:
   ```powershell
   npm start
   # In another terminal:
   npx playwright test tests/integrated-demo.test.js --project="Microsoft Edge" --headed
   ```

3. **Review generated evidence**:
   ```powershell
   npx playwright show-report
   ```

4. **Collect artifacts** from:
   - `playwright-report/` - Test reports and screenshots
   - `test-results/` - Video recordings and detailed results

Your evidence will be automatically generated and ready for submission! 🎉
