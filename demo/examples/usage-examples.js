/**
 * Usage Examples for Kuching ART Online System Models and Services
 * This file demonstrates how to properly use the models and services
 */

// Import all necessary models and services
import User from '../js/models/User.js';
import Order from '../js/models/Order.js';
import OrderItem from '../js/models/OrderItem.js';
import Ticket from '../js/models/Ticket.js';
import Merchandise from '../js/models/Merchandise.js';
import Payment from '../js/models/Payment.js';

import UserService from '../js/services/UserService.js';
import OrderService from '../js/services/OrderService.js';
import TicketService from '../js/services/TicketService.js';
import MerchandiseService from '../js/services/MerchandiseService.js';
import PaymentService from '../js/services/PaymentService.js';

/**
 * Example 1: User Registration and Authentication
 */
async function userRegistrationExample() {
    const userService = new UserService();
    
    // Register a new user
    const userData = {
        userName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'securePassword123',
        phoneNumber: '+60123456789',
        address: '123 Kuching Street, Sarawak'
    };
    
    const registrationResult = await userService.registerUser(userData);
    
    if (registrationResult.success) {
        console.log('User registered successfully:', registrationResult.userID);
        
        // Login the user
        const loginResult = await userService.loginUser(userData.email, userData.password);
        
        if (loginResult.success) {
            console.log('User logged in successfully');
            const currentUser = userService.getCurrentUser();
            console.log('Current user:', currentUser.userName);
        }
    } else {
        console.error('Registration failed:', registrationResult.message);
    }
}

/**
 * Example 2: Ticket Booking Process
 */
async function ticketBookingExample() {
    const ticketService = new TicketService();
    const orderService = new OrderService();
    const userService = new UserService();
    
    // Assume user is logged in
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
        console.error('User must be logged in to book tickets');
        return;
    }
    
    // Get available routes
    const routes = await ticketService.getAvailableRoutes();
    console.log('Available routes:', routes);
    
    // Book a ticket
    const bookingData = {
        routeID: 'route_001',
        departureDate: '2025-06-15',
        departureTime: '09:00',
        passengers: [
            {
                name: 'John Doe',
                type: 'adult',
                price: 25.00
            },
            {
                name: 'Jane Doe',
                type: 'child',
                price: 15.00
            }
        ]
    };
    
    const bookingResult = await ticketService.bookTicket(currentUser.userID, bookingData);
    
    if (bookingResult.success) {
        console.log('Tickets booked successfully:', bookingResult.ticketID);
        
        // Create an order for the tickets
        const orderResult = await orderService.createOrder(currentUser.userID);
        
        if (orderResult.success) {
            // Add ticket to order
            const itemData = {
                itemType: 'ticket',
                itemID: bookingResult.ticketID,
                quantity: bookingData.passengers.length,
                unitPrice: 20.00 // Average price
            };
            
            await orderService.addItemToOrder(orderResult.orderID, itemData);
        }
    }
}

/**
 * Example 3: Merchandise Purchase
 */
async function merchandisePurchaseExample() {
    const merchandiseService = new MerchandiseService();
    const orderService = new OrderService();
    const userService = new UserService();
    
    // Get current user
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
        console.error('User must be logged in to purchase merchandise');
        return;
    }
    
    // Browse merchandise
    const merchandiseList = await merchandiseService.getAllMerchandise();
    console.log('Available merchandise:', merchandiseList);
    
    // Create order for merchandise
    const orderResult = await orderService.createOrder(currentUser.userID);
    
    if (orderResult.success) {
        // Add merchandise items to order
        const items = [
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
            }
        ];
        
        for (const item of items) {
            const addResult = await orderService.addItemToOrder(orderResult.orderID, item);
            console.log('Item added to order:', addResult.success);
        }
        
        // Get order summary
        const orderSummary = await orderService.getOrderSummary(orderResult.orderID);
        console.log('Order Summary:', orderSummary);
    }
}

/**
 * Example 4: Payment Processing
 */
async function paymentProcessingExample() {
    const paymentService = new PaymentService();
    const orderService = new OrderService();
    const userService = new UserService();
    
    // Assume we have an order to pay for
    const currentUser = userService.getCurrentUser();
    const userOrders = await orderService.getUserOrders(currentUser.userID);
    const unpaidOrder = userOrders.find(order => order.paymentStatus === 'unpaid');
    
    if (!unpaidOrder) {
        console.log('No unpaid orders found');
        return;
    }
    
    // Process payment
    const paymentData = {
        orderID: unpaidOrder.orderID,
        amount: unpaidOrder.totalAmount,
        paymentMethod: 'credit_card',
        cardDetails: {
            cardNumber: '4111111111111111',
            expiryMonth: '12',
            expiryYear: '2027',
            cvv: '123',
            cardholderName: 'John Doe'
        }
    };
    
    const paymentResult = await paymentService.processPayment(paymentData);
    
    if (paymentResult.success) {
        console.log('Payment processed successfully:', paymentResult.transactionID);
        
        // Update order status
        await orderService.updateOrderStatus(unpaidOrder.orderID, 'confirmed');
        console.log('Order confirmed');
        
        // Award loyalty points
        const pointsAwarded = Math.floor(unpaidOrder.totalAmount);
        const pointsResult = await userService.addLoyaltyPoints(currentUser.userID, pointsAwarded);
        console.log('Loyalty points awarded:', pointsAwarded);
    } else {
        console.error('Payment failed:', paymentResult.message);
    }
}

/**
 * Example 5: Order Management and Cancellation
 */
async function orderManagementExample() {
    const orderService = new OrderService();
    const userService = new UserService();
    
    const currentUser = userService.getCurrentUser();
    
    // Get user's order history
    const orderHistory = await orderService.getUserOrders(currentUser.userID);
    console.log('Order History:', orderHistory);
    
    // Cancel an order (if eligible)
    const orderToCancel = orderHistory.find(order => 
        order.status === 'pending' || order.status === 'confirmed'
    );
    
    if (orderToCancel) {
        const cancellationResult = await orderService.cancelOrder(orderToCancel.orderID);
        
        if (cancellationResult.success) {
            console.log('Order cancelled successfully');
            
            // Process refund if payment was made
            if (orderToCancel.paymentStatus === 'paid') {
                const paymentService = new PaymentService();
                const refundResult = await paymentService.processRefund(orderToCancel.orderID);
                console.log('Refund processed:', refundResult.success);
            }
        }
    }
}

/**
 * Example 6: Working with User Profile and Preferences
 */
async function userProfileExample() {
    const userService = new UserService();
    
    const currentUser = userService.getCurrentUser();
    
    // Update user profile
    const updatedInfo = {
        userName: 'John Smith',
        phoneNumber: '+60987654321',
        address: '456 New Address, Kuching, Sarawak'
    };
    
    const updateResult = await userService.updateUserProfile(currentUser.userID, updatedInfo);
    
    if (updateResult.success) {
        console.log('Profile updated successfully');
        
        // Get updated user info
        const updatedUser = await userService.getUserById(currentUser.userID);
        console.log('Updated user info:', updatedUser);
    }
    
    // Check loyalty points
    const loyaltyInfo = await userService.getLoyaltyPointsInfo(currentUser.userID);
    console.log('Loyalty points:', loyaltyInfo);
}

/**
 * Example 7: Error Handling Best Practices
 */
async function errorHandlingExample() {
    const userService = new UserService();
    
    try {
        // Attempt to login with invalid credentials
        const loginResult = await userService.loginUser('invalid@email.com', 'wrongpassword');
        
        if (!loginResult.success) {
            console.log('Login failed as expected:', loginResult.message);
            // Handle the error appropriately
            // Show user-friendly error message
            // Log for debugging if necessary
        }
        
        // Attempt to access protected resource without authentication
        const currentUser = userService.getCurrentUser();
        if (!currentUser) {
            throw new Error('Authentication required');
        }
        
    } catch (error) {
        console.error('Error occurred:', error.message);
        // Handle unexpected errors
        // Show generic error message to user
        // Log error for debugging
    }
}

/**
 * Main function to run all examples
 */
async function runAllExamples() {
    console.log('=== Kuching ART Online System - Model and Service Usage Examples ===\n');
    
    try {
        console.log('1. User Registration and Authentication');
        await userRegistrationExample();
        console.log('\n');
        
        console.log('2. Ticket Booking Process');
        await ticketBookingExample();
        console.log('\n');
        
        console.log('3. Merchandise Purchase');
        await merchandisePurchaseExample();
        console.log('\n');
        
        console.log('4. Payment Processing');
        await paymentProcessingExample();
        console.log('\n');
        
        console.log('5. Order Management and Cancellation');
        await orderManagementExample();
        console.log('\n');
        
        console.log('6. User Profile Management');
        await userProfileExample();
        console.log('\n');
        
        console.log('7. Error Handling');
        await errorHandlingExample();
        console.log('\n');
        
    } catch (error) {
        console.error('Error running examples:', error);
    }
}

// Export examples for use in other files
export {
    userRegistrationExample,
    ticketBookingExample,
    merchandisePurchaseExample,
    paymentProcessingExample,
    orderManagementExample,
    userProfileExample,
    errorHandlingExample,
    runAllExamples
};

// Run examples if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.KuchingARTExamples = {
        runAllExamples,
        userRegistrationExample,
        ticketBookingExample,
        merchandisePurchaseExample,
        paymentProcessingExample,
        orderManagementExample,
        userProfileExample,
        errorHandlingExample
    };
}
