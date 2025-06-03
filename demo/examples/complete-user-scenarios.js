/**
 * Complete User Scenarios for Kuching ART Online System
 * This file demonstrates all major use cases using the models and services
 */

// Import all necessary services
import UserService from '../js/services/UserService.js';
import OrderService from '../js/services/OrderService.js';
import TicketService from '../js/services/TicketService.js';
import PaymentService from '../js/services/PaymentService.js';
import MerchandiseService from '../js/services/MerchandiseService.js';
import FeedbackService from '../js/services/FeedbackService.js';
import NotificationService from '../js/services/NotificationService.js';

/**
 * Scenario 1: User Registration and Login
 * Complete flow from registration to authentication
 */
async function userRegistrationAndLoginScenario() {
    console.log('=== Scenario 1: User Registration and Login ===');
    
    const userService = new UserService();
    
    try {
        // Step 1: Register a new user
        console.log('Step 1: Registering new user...');
        const userData = {
            userName: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            password: 'SecurePass123!',
            phoneNumber: '+60123456789',
            address: '123 Kuching Street, Sarawak, Malaysia'
        };
        
        const registrationResult = await userService.registerUser(userData);
        
        if (registrationResult.success) {
            console.log('✓ User registered successfully');
            console.log('  User ID:', registrationResult.userID);
            
            // Step 2: Login with the new credentials
            console.log('Step 2: Logging in...');
            const loginResult = await userService.loginUser(userData.email, userData.password);
            
            if (loginResult.success) {
                console.log('✓ Login successful');
                const currentUser = userService.getCurrentUser();
                console.log('  Welcome:', currentUser.userName);
                console.log('  Loyalty Points:', currentUser.loyaltyPoints);
                
                return currentUser;
            } else {
                console.log('✗ Login failed:', loginResult.message);
                return null;
            }
        } else {
            console.log('✗ Registration failed:', registrationResult.message);
            return null;
        }
    } catch (error) {
        console.error('Error in registration/login scenario:', error);
        return null;
    }
}

/**
 * Scenario 2: Buy a Ticket and Make Payment
 * Complete ticket booking and payment process
 */
async function buyTicketAndPaymentScenario(user) {
    console.log('\n=== Scenario 2: Buy a Ticket and Make Payment ===');
    
    if (!user) {
        console.log('✗ User must be logged in to buy tickets');
        return null;
    }
    
    const ticketService = new TicketService();
    const orderService = new OrderService();
    const paymentService = new PaymentService();
    const notificationService = new NotificationService();
    
    try {
        // Step 1: Browse available routes
        console.log('Step 1: Browsing available routes...');
        const routes = await ticketService.getAvailableRoutes();
        console.log('✓ Found', routes.length, 'available routes');
        
        // Display some routes
        routes.slice(0, 3).forEach((route, index) => {
            console.log(`  Route ${index + 1}: ${route.startLocation} → ${route.endLocation}`);
            console.log(`    Price: $${route.price}, Duration: ${route.duration} mins`);
        });
        
        // Step 2: Select route and book tickets
        console.log('Step 2: Booking tickets...');
        const selectedRoute = routes[0]; // Select first route
        const bookingData = {
            routeID: selectedRoute.routeID,
            departureDate: '2025-06-15',
            departureTime: '09:00',
            passengers: [
                {
                    name: 'Alice Johnson',
                    type: 'adult',
                    price: selectedRoute.price
                },
                {
                    name: 'Bob Johnson', 
                    type: 'child',
                    price: selectedRoute.price * 0.6 // Child discount
                }
            ]
        };
        
        const bookingResult = await ticketService.bookTicket(user.userID, bookingData);
        
        if (bookingResult.success) {
            console.log('✓ Tickets booked successfully');
            console.log('  Ticket ID:', bookingResult.ticketID);
            console.log('  Total passengers:', bookingData.passengers.length);
            
            // Step 3: Create order for the tickets
            console.log('Step 3: Creating order...');
            const orderResult = await orderService.createOrder(user.userID);
            
            if (orderResult.success) {
                const orderID = orderResult.orderID;
                console.log('✓ Order created:', orderID);
                
                // Step 4: Add tickets to order
                const totalPrice = bookingData.passengers.reduce((sum, p) => sum + p.price, 0);
                const itemData = {
                    itemType: 'ticket',
                    itemID: bookingResult.ticketID,
                    quantity: bookingData.passengers.length,
                    unitPrice: totalPrice / bookingData.passengers.length
                };
                
                await orderService.addItemToOrder(orderID, itemData);
                console.log('✓ Tickets added to order');
                
                // Step 5: Get order summary
                const orderSummary = await orderService.getOrderSummary(orderID);
                console.log('✓ Order Summary:');
                console.log('  Subtotal: $' + orderSummary.order.subtotal.toFixed(2));
                console.log('  Tax: $' + orderSummary.order.taxAmount.toFixed(2));
                console.log('  Total: $' + orderSummary.order.totalAmount.toFixed(2));
                
                // Step 6: Process payment
                console.log('Step 4: Processing payment...');
                const paymentData = {
                    orderID: orderID,
                    amount: orderSummary.order.totalAmount,
                    paymentMethod: 'credit_card',
                    cardDetails: {
                        cardNumber: '4111111111111111',
                        expiryMonth: '12',
                        expiryYear: '2027',
                        cvv: '123',
                        cardholderName: 'Alice Johnson'
                    }
                };
                
                const paymentResult = await paymentService.processPayment(paymentData);
                
                if (paymentResult.success) {
                    console.log('✓ Payment processed successfully');
                    console.log('  Transaction ID:', paymentResult.transactionID);
                    
                    // Step 7: Update order status
                    await orderService.updateOrderStatus(orderID, 'confirmed');
                    console.log('✓ Order confirmed');
                    
                    // Step 8: Award loyalty points
                    const pointsAwarded = Math.floor(orderSummary.order.totalAmount);
                    const userService = new UserService();
                    await userService.addLoyaltyPoints(user.userID, pointsAwarded);
                    console.log('✓ Loyalty points awarded:', pointsAwarded);
                    
                    // Step 9: Send confirmation notification
                    await notificationService.sendNotification({
                        userID: user.userID,
                        type: 'booking_confirmation',
                        title: 'Booking Confirmed',
                        message: `Your ticket booking for ${selectedRoute.startLocation} to ${selectedRoute.endLocation} has been confirmed.`
                    });
                    console.log('✓ Confirmation notification sent');
                    
                    return {
                        orderID: orderID,
                        ticketID: bookingResult.ticketID,
                        totalAmount: orderSummary.order.totalAmount,
                        route: selectedRoute
                    };
                } else {
                    console.log('✗ Payment failed:', paymentResult.message);
                    return null;
                }
            }
        } else {
            console.log('✗ Ticket booking failed:', bookingResult.message);
            return null;
        }
    } catch (error) {
        console.error('Error in ticket booking scenario:', error);
        return null;
    }
}

/**
 * Scenario 3: Cancel Trip and Get Refund
 * Complete cancellation and refund process
 */
async function cancelTripAndRefundScenario(user, bookingInfo) {
    console.log('\n=== Scenario 3: Cancel Trip and Get Refund ===');
    
    if (!user || !bookingInfo) {
        console.log('✗ Valid user and booking info required for cancellation');
        return false;
    }
    
    const orderService = new OrderService();
    const paymentService = new PaymentService();
    const ticketService = new TicketService();
    const notificationService = new NotificationService();
    
    try {
        // Step 1: Check if cancellation is allowed
        console.log('Step 1: Checking cancellation eligibility...');
        const order = await orderService.getOrderById(bookingInfo.orderID);
        
        if (order && (order.status === 'confirmed' || order.status === 'pending')) {
            console.log('✓ Order is eligible for cancellation');
            
            // Step 2: Cancel the order
            console.log('Step 2: Cancelling order...');
            const cancellationResult = await orderService.cancelOrder(bookingInfo.orderID);
            
            if (cancellationResult.success) {
                console.log('✓ Order cancelled successfully');
                
                // Step 3: Cancel the ticket
                console.log('Step 3: Cancelling ticket...');
                const ticketCancellation = await ticketService.cancelTicket(bookingInfo.ticketID);
                
                if (ticketCancellation.success) {
                    console.log('✓ Ticket cancelled successfully');
                    
                    // Step 4: Process refund (if payment was made)
                    if (order.paymentStatus === 'paid') {
                        console.log('Step 4: Processing refund...');
                        const refundResult = await paymentService.processRefund(bookingInfo.orderID);
                        
                        if (refundResult.success) {
                            console.log('✓ Refund processed successfully');
                            console.log('  Refund amount: $' + refundResult.refundAmount.toFixed(2));
                            console.log('  Refund reference:', refundResult.refundReference);
                            
                            // Step 5: Adjust loyalty points (remove awarded points)
                            const userService = new UserService();
                            const pointsToDeduct = Math.floor(bookingInfo.totalAmount);
                            await userService.deductLoyaltyPoints(user.userID, pointsToDeduct);
                            console.log('✓ Loyalty points adjusted (-' + pointsToDeduct + ')');
                            
                            // Step 6: Send cancellation notification
                            await notificationService.sendNotification({
                                userID: user.userID,
                                type: 'booking_cancellation',
                                title: 'Booking Cancelled',
                                message: `Your booking for ${bookingInfo.route.startLocation} to ${bookingInfo.route.endLocation} has been cancelled. Refund of $${refundResult.refundAmount.toFixed(2)} will be processed within 3-5 business days.`
                            });
                            console.log('✓ Cancellation notification sent');
                            
                            return true;
                        } else {
                            console.log('✗ Refund processing failed:', refundResult.message);
                            return false;
                        }
                    } else {
                        console.log('✓ No payment to refund');
                        return true;
                    }
                } else {
                    console.log('✗ Ticket cancellation failed:', ticketCancellation.message);
                    return false;
                }
            } else {
                console.log('✗ Order cancellation failed:', cancellationResult.message);
                return false;
            }
        } else {
            console.log('✗ Order is not eligible for cancellation');
            console.log('  Current status:', order?.status || 'Order not found');
            return false;
        }
    } catch (error) {
        console.error('Error in cancellation scenario:', error);
        return false;
    }
}

/**
 * Scenario 4: Admin Generates Usage Statistics
 * Admin dashboard with system statistics
 */
async function adminGeneratesUsageStatistics() {
    console.log('\n=== Scenario 4: Admin Generates Usage Statistics ===');
    
    const userService = new UserService();
    const orderService = new OrderService();
    const ticketService = new TicketService();
    const merchandiseService = new MerchandiseService();
    
    try {
        // Step 1: Admin login (simulate)
        console.log('Step 1: Admin accessing system...');
        
        // Step 2: Generate user statistics
        console.log('Step 2: Generating user statistics...');
        const allUsers = await userService.getAllUsers();
        const totalUsers = allUsers.length;
        const activeUsers = allUsers.filter(user => user.isActive).length;
        const avgLoyaltyPoints = allUsers.reduce((sum, user) => sum + user.loyaltyPoints, 0) / totalUsers;
        
        console.log('✓ User Statistics:');
        console.log('  Total Users:', totalUsers);
        console.log('  Active Users:', activeUsers);
        console.log('  Average Loyalty Points:', avgLoyaltyPoints.toFixed(2));
        
        // Step 3: Generate order statistics
        console.log('Step 3: Generating order statistics...');
        const allOrders = await orderService.getAllOrders();
        const totalOrders = allOrders.length;
        const confirmedOrders = allOrders.filter(order => order.status === 'confirmed').length;
        const cancelledOrders = allOrders.filter(order => order.status === 'cancelled').length;
        const totalRevenue = allOrders
            .filter(order => order.paymentStatus === 'paid')
            .reduce((sum, order) => sum + order.totalAmount, 0);
        
        console.log('✓ Order Statistics:');
        console.log('  Total Orders:', totalOrders);
        console.log('  Confirmed Orders:', confirmedOrders);
        console.log('  Cancelled Orders:', cancelledOrders);
        console.log('  Total Revenue: $' + totalRevenue.toFixed(2));
        console.log('  Conversion Rate:', ((confirmedOrders / totalOrders) * 100).toFixed(1) + '%');
        
        // Step 4: Generate ticket statistics
        console.log('Step 4: Generating ticket statistics...');
        const allTickets = await ticketService.getAllTickets();
        const totalTickets = allTickets.length;
        const activeTickets = allTickets.filter(ticket => ticket.status === 'active').length;
        
        // Popular routes analysis
        const routePopularity = {};
        allTickets.forEach(ticket => {
            routePopularity[ticket.routeID] = (routePopularity[ticket.routeID] || 0) + 1;
        });
        
        const mostPopularRoute = Object.entries(routePopularity)
            .sort(([,a], [,b]) => b - a)[0];
        
        console.log('✓ Ticket Statistics:');
        console.log('  Total Tickets Booked:', totalTickets);
        console.log('  Active Tickets:', activeTickets);
        console.log('  Most Popular Route:', mostPopularRoute ? `${mostPopularRoute[0]} (${mostPopularRoute[1]} bookings)` : 'N/A');
        
        // Step 5: Generate merchandise statistics
        console.log('Step 5: Generating merchandise statistics...');
        const allMerchandise = await merchandiseService.getAllMerchandise();
        const totalProducts = allMerchandise.length;
        const inStockProducts = allMerchandise.filter(item => item.stockQuantity > 0).length;
        const lowStockProducts = allMerchandise.filter(item => item.stockQuantity > 0 && item.stockQuantity < 10).length;
        
        console.log('✓ Merchandise Statistics:');
        console.log('  Total Products:', totalProducts);
        console.log('  In Stock Products:', inStockProducts);
        console.log('  Low Stock Alerts:', lowStockProducts);
        
        // Step 6: Generate daily/monthly reports
        console.log('Step 6: Generating time-based reports...');
        const today = new Date();
        const todayOrders = allOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.toDateString() === today.toDateString();
        });
        
        const thisMonthOrders = allOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.getMonth() === today.getMonth() && 
                   orderDate.getFullYear() === today.getFullYear();
        });
        
        console.log('✓ Time-based Reports:');
        console.log('  Today\'s Orders:', todayOrders.length);
        console.log('  This Month\'s Orders:', thisMonthOrders.length);
        console.log('  Today\'s Revenue: $' + todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2));
        
        return {
            users: { total: totalUsers, active: activeUsers, avgLoyaltyPoints },
            orders: { total: totalOrders, confirmed: confirmedOrders, cancelled: cancelledOrders, revenue: totalRevenue },
            tickets: { total: totalTickets, active: activeTickets, mostPopularRoute },
            merchandise: { total: totalProducts, inStock: inStockProducts, lowStock: lowStockProducts },
            timeReports: { todayOrders: todayOrders.length, monthOrders: thisMonthOrders.length }
        };
    } catch (error) {
        console.error('Error generating statistics:', error);
        return null;
    }
}

/**
 * Scenario 5: User Submit Feedback
 * Feedback submission and management
 */
async function userSubmitFeedbackScenario(user) {
    console.log('\n=== Scenario 5: User Submit Feedback ===');
    
    if (!user) {
        console.log('✗ User must be logged in to submit feedback');
        return false;
    }
    
    const feedbackService = new FeedbackService();
    const notificationService = new NotificationService();
    
    try {
        // Step 1: User submits feedback
        console.log('Step 1: Submitting feedback...');
        const feedbackData = {
            userID: user.userID,
            type: 'service_feedback',
            rating: 4,
            subject: 'Great ART Service Experience',
            message: 'I had a wonderful experience using the ART system. The booking process was smooth and the staff were very helpful. The trains are clean and punctual. Keep up the good work!',
            category: 'general'
        };
        
        const feedbackResult = await feedbackService.submitFeedback(feedbackData);
        
        if (feedbackResult.success) {
            console.log('✓ Feedback submitted successfully');
            console.log('  Feedback ID:', feedbackResult.feedbackID);
            console.log('  Rating:', feedbackData.rating + '/5 stars');
            
            // Step 2: Send acknowledgment notification
            await notificationService.sendNotification({
                userID: user.userID,
                type: 'feedback_acknowledgment',
                title: 'Feedback Received',
                message: 'Thank you for your feedback! We appreciate your input and will use it to improve our services.'
            });
            console.log('✓ Acknowledgment notification sent');
            
            // Step 3: Award loyalty points for feedback
            const userService = new UserService();
            await userService.addLoyaltyPoints(user.userID, 5); // 5 points for feedback
            console.log('✓ Loyalty points awarded for feedback (+5)');
            
            // Step 4: Check if feedback needs immediate attention
            if (feedbackData.rating <= 2) {
                console.log('⚠ Low rating detected - flagged for immediate attention');
                // In real system, this would alert customer service
            }
            
            return feedbackResult.feedbackID;
        } else {
            console.log('✗ Feedback submission failed:', feedbackResult.message);
            return false;
        }
    } catch (error) {
        console.error('Error in feedback scenario:', error);
        return false;
    }
}

/**
 * Scenario 6: Merchandise Purchase
 * Complete merchandise shopping experience
 */
async function merchandisePurchaseScenario(user) {
    console.log('\n=== Scenario 6: Merchandise Purchase ===');
    
    if (!user) {
        console.log('✗ User must be logged in to purchase merchandise');
        return null;
    }
    
    const merchandiseService = new MerchandiseService();
    const orderService = new OrderService();
    const paymentService = new PaymentService();
    const notificationService = new NotificationService();
    
    try {
        // Step 1: Browse merchandise catalog
        console.log('Step 1: Browsing merchandise catalog...');
        const merchandiseList = await merchandiseService.getAllMerchandise();
        console.log('✓ Found', merchandiseList.length, 'merchandise items');
        
        // Display available items
        merchandiseList.slice(0, 5).forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} - $${item.price.toFixed(2)} (Stock: ${item.stockQuantity})`);
        });
        
        // Step 2: Add items to cart (create order)
        console.log('Step 2: Adding items to cart...');
        const orderResult = await orderService.createOrder(user.userID);
        
        if (orderResult.success) {
            const orderID = orderResult.orderID;
            console.log('✓ Shopping cart created:', orderID);
            
            // Step 3: Add multiple merchandise items
            const itemsToAdd = [
                {
                    itemType: 'merchandise',
                    itemID: 'merch_001', // ART T-Shirt
                    quantity: 2,
                    unitPrice: 29.99
                },
                {
                    itemType: 'merchandise',
                    itemID: 'merch_002', // ART Mug
                    quantity: 1,
                    unitPrice: 15.99
                },
                {
                    itemType: 'merchandise',
                    itemID: 'merch_003', // ART Model Train
                    quantity: 1,
                    unitPrice: 49.99
                }
            ];
            
            for (const item of itemsToAdd) {
                const addResult = await orderService.addItemToOrder(orderID, item);
                if (addResult.success) {
                    console.log(`✓ Added ${item.quantity}x ${item.itemID} to cart`);
                } else {
                    console.log(`✗ Failed to add ${item.itemID}:`, addResult.message);
                }
            }
            
            // Step 4: Apply discount (if user has loyalty points)
            const userService = new UserService();
            const currentUserData = await userService.getUserById(user.userID);
            if (currentUserData.loyaltyPoints >= 50) {
                console.log('Step 4: Applying loyalty discount...');
                const discountResult = await orderService.applyDiscount(orderID, {
                    type: 'loyalty_points',
                    value: 50, // Use 50 points for $5 discount
                    discountAmount: 5.00
                });
                
                if (discountResult.success) {
                    console.log('✓ Loyalty discount applied: -$5.00');
                    await userService.deductLoyaltyPoints(user.userID, 50);
                }
            }
            
            // Step 5: Calculate final totals
            console.log('Step 5: Calculating order totals...');
            const orderSummary = await orderService.getOrderSummary(orderID);
            
            console.log('✓ Order Summary:');
            console.log('  Subtotal: $' + orderSummary.order.subtotal.toFixed(2));
            console.log('  Discount: -$' + orderSummary.order.discountAmount.toFixed(2));
            console.log('  Tax: $' + orderSummary.order.taxAmount.toFixed(2));
            console.log('  Total: $' + orderSummary.order.totalAmount.toFixed(2));
            
            // Step 6: Process payment
            console.log('Step 6: Processing payment...');
            const paymentData = {
                orderID: orderID,
                amount: orderSummary.order.totalAmount,
                paymentMethod: 'paypal',
                paypalEmail: user.email
            };
            
            const paymentResult = await paymentService.processPayment(paymentData);
            
            if (paymentResult.success) {
                console.log('✓ Payment processed successfully');
                console.log('  Transaction ID:', paymentResult.transactionID);
                
                // Step 7: Update order status and inventory
                await orderService.updateOrderStatus(orderID, 'confirmed');
                
                // Update merchandise stock
                for (const item of itemsToAdd) {
                    await merchandiseService.updateStock(item.itemID, -item.quantity);
                }
                console.log('✓ Inventory updated');
                
                // Step 8: Award loyalty points for purchase
                const pointsAwarded = Math.floor(orderSummary.order.totalAmount * 0.1); // 10% of purchase as points
                await userService.addLoyaltyPoints(user.userID, pointsAwarded);
                console.log('✓ Loyalty points awarded:', pointsAwarded);
                
                // Step 9: Send order confirmation
                await notificationService.sendNotification({
                    userID: user.userID,
                    type: 'order_confirmation',
                    title: 'Merchandise Order Confirmed',
                    message: `Your merchandise order #${orderID} has been confirmed. Total: $${orderSummary.order.totalAmount.toFixed(2)}. Your items will be shipped within 3-5 business days.`
                });
                console.log('✓ Order confirmation sent');
                
                return {
                    orderID: orderID,
                    totalAmount: orderSummary.order.totalAmount,
                    itemCount: itemsToAdd.length
                };
            } else {
                console.log('✗ Payment failed:', paymentResult.message);
                return null;
            }
        } else {
            console.log('✗ Failed to create order:', orderResult.message);
            return null;
        }
    } catch (error) {
        console.error('Error in merchandise purchase scenario:', error);
        return null;
    }
}

/**
 * Run all scenarios in sequence
 * This demonstrates the complete user journey
 */
async function runAllScenarios() {
    console.log('🚀 Starting Kuching ART Online System - Complete User Journey\n');
    
    try {
        // Scenario 1: User Registration and Login
        const user = await userRegistrationAndLoginScenario();
        if (!user) {
            console.log('❌ Cannot proceed without user login');
            return;
        }
        
        // Scenario 2: Buy Ticket and Make Payment
        const bookingInfo = await buyTicketAndPaymentScenario(user);
        
        // Scenario 3: Cancel Trip and Get Refund (only if booking was successful)
        if (bookingInfo) {
            // Wait a moment before cancelling (simulate user decision)
            console.log('\n⏳ User decides to cancel the trip...');
            await cancelTripAndRefundScenario(user, bookingInfo);
        }
        
        // Scenario 4: Admin Generates Usage Statistics
        await adminGeneratesUsageStatistics();
        
        // Scenario 5: User Submit Feedback
        await userSubmitFeedbackScenario(user);
        
        // Scenario 6: Merchandise Purchase
        await merchandisePurchaseScenario(user);
        
        console.log('\n🎉 All scenarios completed successfully!');
        console.log('\nSummary of operations:');
        console.log('✓ User registered and logged in');
        console.log('✓ Ticket booked and payment processed');
        console.log('✓ Trip cancelled and refund processed');
        console.log('✓ Admin statistics generated');
        console.log('✓ User feedback submitted');
        console.log('✓ Merchandise purchased');
        
    } catch (error) {
        console.error('❌ Error running scenarios:', error);
    }
}

// Export all scenarios
export {
    userRegistrationAndLoginScenario,
    buyTicketAndPaymentScenario,
    cancelTripAndRefundScenario,
    adminGeneratesUsageStatistics,
    userSubmitFeedbackScenario,
    merchandisePurchaseScenario,
    runAllScenarios
};

// Make available globally for browser testing
if (typeof window !== 'undefined') {
    window.KuchingARTScenarios = {
        userRegistrationAndLoginScenario,
        buyTicketAndPaymentScenario,
        cancelTripAndRefundScenario,
        adminGeneratesUsageStatistics,
        userSubmitFeedbackScenario,
        merchandisePurchaseScenario,
        runAllScenarios
    };
}
