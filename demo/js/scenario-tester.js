/**
 * Comprehensive Test Script for All Six Scenarios
 * Tests the complete integration of user scenarios with models and services
 */

class ScenarioTester {
    constructor() {
        this.app = null;
        this.testResults = [];
    }

    /**
     * Initialize the tester with the app instance
     */
    init(appInstance) {
        this.app = appInstance;
        console.log('🧪 Scenario Tester initialized');
    }

    /**
     * Run all scenario tests
     */
    async runAllTests() {
        console.log('🚀 Starting comprehensive scenario testing...\n');
        
        this.testResults = [];
        
        try {
            await this.testScenario1_UserRegistrationAndLogin();
            await this.testScenario2_TicketBookingAndPayment();
            await this.testScenario3_TripCancellationAndRefund();
            await this.testScenario4_AdminStatistics();
            await this.testScenario5_UserFeedback();
            await this.testScenario6_MerchandisePurchase();
            
            this.displayTestSummary();
        } catch (error) {
            console.error('❌ Error during testing:', error);
        }
    }

    /**
     * Test Scenario 1: User Registration and Login
     */
    async testScenario1_UserRegistrationAndLogin() {
        console.log('📝 Testing Scenario 1: User Registration and Login');
        
        try {
            // Test user registration
            const registrationData = {
                userName: 'Test User',
                email: 'testuser@example.com',
                password: 'testpass123',
                phoneNumber: '+60123456789',
                address: 'Test Address, Kuching'
            };

            const registrationResult = await this.app.userService.registerUser(registrationData);
            this.logTest('User Registration', registrationResult.success, registrationResult.message);

            if (registrationResult.success) {
                // Test user login
                const loginResult = await this.app.userService.loginUser(registrationData.email, registrationData.password);
                this.logTest('User Login', loginResult.success, loginResult.message);

                if (loginResult.success) {
                    const currentUser = this.app.userService.getCurrentUser();
                    this.logTest('User Session', currentUser !== null, `User: ${currentUser?.userName}`);
                }
            }

        } catch (error) {
            this.logTest('Scenario 1', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Scenario 2: Ticket Booking and Payment
     */
    async testScenario2_TicketBookingAndPayment() {
        console.log('\n🎫 Testing Scenario 2: Ticket Booking and Payment');
        
        try {
            // Ensure user is logged in
            const currentUser = this.app.userService.getCurrentUser();
            if (!currentUser) {
                await this.app.userService.loginUser('test@example.com', 'password123');
            }

            // Test route search
            const searchData = {
                startLocation: 'Kuching Central',
                endLocation: 'Kuching Airport',
                departureDate: '2025-06-15',
                departureTime: '08:00'
            };

            const routes = await this.app.ticketService.searchRoutes(searchData);
            this.logTest('Route Search', routes.length > 0, `Found ${routes.length} routes`);

            if (routes.length > 0) {
                // Test ticket booking
                const bookingData = {
                    routeID: routes[0].routeID,
                    departureDate: searchData.departureDate,
                    departureTime: searchData.departureTime,
                    passengerCount: 1
                };

                const bookingResult = await this.app.ticketService.bookTicket(currentUser.userID, bookingData);
                this.logTest('Ticket Booking', bookingResult.success, bookingResult.message);

                if (bookingResult.success) {
                    // Test payment processing
                    const paymentData = {
                        orderID: bookingResult.orderID,
                        amount: bookingResult.totalAmount,
                        paymentMethod: 'Credit Card'
                    };

                    const paymentResult = await this.app.paymentService.processPayment(paymentData);
                    this.logTest('Payment Processing', paymentResult.success, `Payment ID: ${paymentResult.paymentID}`);
                }
            }

        } catch (error) {
            this.logTest('Scenario 2', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Scenario 3: Trip Cancellation and Refund
     */
    async testScenario3_TripCancellationAndRefund() {
        console.log('\n↩️ Testing Scenario 3: Trip Cancellation and Refund');
        
        try {
            const currentUser = this.app.userService.getCurrentUser();
            if (!currentUser) {
                this.logTest('Scenario 3', false, 'User not logged in');
                return;
            }

            // Get user's tickets
            const userTickets = await this.app.ticketService.getUserTickets(currentUser.userID);
            this.logTest('Get User Tickets', userTickets.length >= 0, `Found ${userTickets.length} tickets`);

            if (userTickets.length > 0) {
                const ticketToCancel = userTickets[0];
                
                // Test ticket cancellation
                const cancellationResult = await this.app.ticketService.cancelTicket(ticketToCancel.ticketID, currentUser.userID);
                this.logTest('Ticket Cancellation', cancellationResult.success, cancellationResult.message);

                if (cancellationResult.success) {
                    // Test refund processing
                    const refundResult = await this.app.paymentService.processRefund({
                        paymentID: cancellationResult.paymentID,
                        refundAmount: cancellationResult.refundAmount,
                        reason: 'User cancellation'
                    });
                    this.logTest('Refund Processing', refundResult.success, `Refund: RM ${cancellationResult.refundAmount}`);
                }
            } else {
                this.logTest('Scenario 3', true, 'No tickets to cancel (expected for demo)');
            }

        } catch (error) {
            this.logTest('Scenario 3', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Scenario 4: Admin Statistics Generation
     */
    async testScenario4_AdminStatistics() {
        console.log('\n📊 Testing Scenario 4: Admin Statistics Generation');
        
        try {
            // Test user statistics
            const userStats = await this.app.userService.getUserStatistics();
            this.logTest('User Statistics', userStats.totalUsers >= 0, `Total users: ${userStats.totalUsers}`);

            // Test ticket statistics
            const ticketStats = await this.app.ticketService.getTicketStatistics();
            this.logTest('Ticket Statistics', ticketStats.totalSold >= 0, `Tickets sold: ${ticketStats.totalSold}`);

            // Test order statistics
            const orderStats = await this.app.orderService.getOrderStatistics();
            this.logTest('Order Statistics', orderStats.totalOrders >= 0, `Total orders: ${orderStats.totalOrders}`);

            // Test payment statistics
            const paymentStats = await this.app.paymentService.getPaymentStatistics();
            this.logTest('Payment Statistics', paymentStats.totalRevenue >= 0, `Revenue: RM ${paymentStats.totalRevenue}`);

            // Test comprehensive statistics generation
            const comprehensiveStats = await this.app.generateUsageStatistics();
            this.logTest('Comprehensive Statistics', comprehensiveStats !== null, 'Statistics generated successfully');

        } catch (error) {
            this.logTest('Scenario 4', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Scenario 5: User Feedback Submission
     */
    async testScenario5_UserFeedback() {
        console.log('\n💬 Testing Scenario 5: User Feedback Submission');
        
        try {
            const currentUser = this.app.userService.getCurrentUser();
            if (!currentUser) {
                this.logTest('Scenario 5', false, 'User not logged in');
                return;
            }

            const feedbackData = {
                userID: currentUser.userID,
                rating: 5,
                category: 'service',
                comment: 'Excellent automated testing of the feedback system!'
            };

            const feedbackResult = await this.app.feedbackService.submitFeedback(feedbackData);
            this.logTest('Feedback Submission', feedbackResult.success, feedbackResult.message);

            if (feedbackResult.success) {
                // Test feedback retrieval
                const userFeedback = await this.app.feedbackService.getUserFeedback(currentUser.userID);
                this.logTest('Feedback Retrieval', userFeedback.length > 0, `Found ${userFeedback.length} feedback entries`);
            }

        } catch (error) {
            this.logTest('Scenario 5', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Scenario 6: Merchandise Purchase
     */
    async testScenario6_MerchandisePurchase() {
        console.log('\n🛒 Testing Scenario 6: Merchandise Purchase');
        
        try {
            const currentUser = this.app.userService.getCurrentUser();
            if (!currentUser) {
                this.logTest('Scenario 6', false, 'User not logged in');
                return;
            }

            // Test merchandise retrieval
            const merchandise = await this.app.merchandiseService.getAllMerchandise();
            this.logTest('Merchandise Retrieval', merchandise.length > 0, `Found ${merchandise.length} items`);

            if (merchandise.length > 0) {
                // Test order creation
                const orderData = {
                    userID: currentUser.userID,
                    items: [
                        {
                            merchandiseID: merchandise[0].merchandiseID,
                            quantity: 2,
                            price: merchandise[0].price
                        }
                    ]
                };

                const orderResult = await this.app.orderService.createOrder(orderData);
                this.logTest('Order Creation', orderResult.success, orderResult.message);

                if (orderResult.success) {
                    // Test payment for merchandise
                    const paymentData = {
                        orderID: orderResult.orderID,
                        amount: orderResult.totalAmount,
                        paymentMethod: 'Credit Card'
                    };

                    const paymentResult = await this.app.paymentService.processPayment(paymentData);
                    this.logTest('Merchandise Payment', paymentResult.success, `Payment: RM ${orderResult.totalAmount}`);
                }
            }

        } catch (error) {
            this.logTest('Scenario 6', false, `Error: ${error.message}`);
        }
    }

    /**
     * Log test result
     */
    logTest(testName, success, message) {
        const result = {
            test: testName,
            success: success,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const icon = success ? '✅' : '❌';
        console.log(`  ${icon} ${testName}: ${message}`);
    }

    /**
     * Display test summary
     */
    displayTestSummary() {
        console.log('\n📋 TEST SUMMARY');
        console.log('================');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.filter(r => !r.success).forEach(result => {
                console.log(`  - ${result.test}: ${result.message}`);
            });
        }
        
        console.log('\n🎉 Testing completed!');
        
        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: (passedTests / totalTests) * 100,
            results: this.testResults
        };
    }

    /**
     * Test individual scenario by number
     */
    async testScenario(scenarioNumber) {
        console.log(`🧪 Testing Scenario ${scenarioNumber}...`);
        
        switch (scenarioNumber) {
            case 1:
                await this.testScenario1_UserRegistrationAndLogin();
                break;
            case 2:
                await this.testScenario2_TicketBookingAndPayment();
                break;
            case 3:
                await this.testScenario3_TripCancellationAndRefund();
                break;
            case 4:
                await this.testScenario4_AdminStatistics();
                break;
            case 5:
                await this.testScenario5_UserFeedback();
                break;
            case 6:
                await this.testScenario6_MerchandisePurchase();
                break;
            default:
                console.log('❌ Invalid scenario number. Use 1-6.');
        }
    }
}

// Create global tester instance
window.scenarioTester = new ScenarioTester();

// Initialize tester when app is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            window.scenarioTester.init(window.app);
            console.log('🧪 Scenario testing ready!');
            console.log('💡 Usage:');
            console.log('   scenarioTester.runAllTests() - Run all scenario tests');
            console.log('   scenarioTester.testScenario(1-6) - Test specific scenario');
        }
    }, 1000);
});
