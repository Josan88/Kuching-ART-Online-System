# Implementation Guide: Integrating User Scenarios with Models and Services

## Overview

This guide shows you how to integrate the six main user scenarios into your existing Kuching ART Online System using the proper models and services architecture.

## Quick Start

1. **Test the scenarios**: Open `demo-scenarios.html` in your browser
2. **Review the code**: Study `complete-user-scenarios.js` for implementation patterns
3. **Integrate**: Follow the patterns below to update your existing files

## Scenario Implementations

### 1. User Registration and Login

**Files to Update**: `app.js`, `login.html`

```javascript
// In your app.js - Update the handleLogin method
async handleLogin(e) {
    e.preventDefault();
    const userService = new UserService();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const loginResult = await userService.loginUser(email, password);
        
        if (loginResult.success) {
            this.currentUser = userService.getCurrentUser();
            this.hideModal('loginModal');
            this.updateAuthUI();
            await this.loadUserData();
            this.showNotification('Login successful!', 'success');
            document.getElementById('loginForm').reset();
        } else {
            this.showNotification(loginResult.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        this.showNotification('Login failed. Please try again.', 'error');
    }
}

// Update the handleRegister method
async handleRegister(e) {
    e.preventDefault();
    const userService = new UserService();
    
    const userData = {
        userName: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        phoneNumber: document.getElementById('registerPhone').value,
        address: document.getElementById('registerAddress').value
    };

    try {
        const registrationResult = await userService.registerUser(userData);
        
        if (registrationResult.success) {
            this.hideModal('registerModal');
            this.showNotification('Registration successful! Please login.', 'success');
            document.getElementById('registerForm').reset();
            this.showModal('loginModal');
        } else {
            this.showNotification(registrationResult.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        this.showNotification('Registration failed. Please try again.', 'error');
    }
}
```

### 2. Buy Ticket and Make Payment

**Files to Update**: `booking.js`, `booking.html`

```javascript
// Add to your booking.js
class TicketBookingSystem {
    constructor() {
        this.ticketService = new TicketService();
        this.orderService = new OrderService();
        this.paymentService = new PaymentService();
        this.userService = new UserService();
    }

    async bookTickets(routeId, passengers, departureDate, departureTime) {
        try {
            const currentUser = this.userService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Please login to book tickets');
            }

            // Step 1: Book the tickets
            const bookingData = {
                routeID: routeId,
                departureDate: departureDate,
                departureTime: departureTime,
                passengers: passengers
            };

            const bookingResult = await this.ticketService.bookTicket(currentUser.userID, bookingData);
            
            if (!bookingResult.success) {
                throw new Error(bookingResult.message);
            }

            // Step 2: Create order
            const orderResult = await this.orderService.createOrder(currentUser.userID);
            if (!orderResult.success) {
                throw new Error('Failed to create order');
            }

            // Step 3: Add tickets to order
            const totalPrice = passengers.reduce((sum, p) => sum + p.price, 0);
            const itemData = {
                itemType: 'ticket',
                itemID: bookingResult.ticketID,
                quantity: passengers.length,
                unitPrice: totalPrice / passengers.length
            };

            await this.orderService.addItemToOrder(orderResult.orderID, itemData);

            // Step 4: Get order summary for payment
            const orderSummary = await this.orderService.getOrderSummary(orderResult.orderID);

            return {
                success: true,
                orderID: orderResult.orderID,
                ticketID: bookingResult.ticketID,
                orderSummary: orderSummary.order
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async processPayment(orderID, paymentDetails) {
        try {
            const paymentResult = await this.paymentService.processPayment({
                orderID: orderID,
                amount: paymentDetails.amount,
                paymentMethod: paymentDetails.method,
                cardDetails: paymentDetails.cardDetails
            });

            if (paymentResult.success) {
                // Update order status
                await this.orderService.updateOrderStatus(orderID, 'confirmed');
                
                // Award loyalty points
                const currentUser = this.userService.getCurrentUser();
                const pointsAwarded = Math.floor(paymentDetails.amount);
                await this.userService.addLoyaltyPoints(currentUser.userID, pointsAwarded);

                return {
                    success: true,
                    transactionID: paymentResult.transactionID
                };
            } else {
                return {
                    success: false,
                    message: paymentResult.message
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}
```

### 3. Cancel Trip and Get Refund

**Files to Update**: `cancel-refund.html`, add new `cancel-refund.js`

```javascript
// Create cancel-refund.js
class CancellationSystem {
    constructor() {
        this.orderService = new OrderService();
        this.paymentService = new PaymentService();
        this.ticketService = new TicketService();
        this.userService = new UserService();
        this.notificationService = new NotificationService();
    }

    async cancelBooking(orderID) {
        try {
            const currentUser = this.userService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Please login to cancel bookings');
            }

            // Step 1: Get order details
            const order = await this.orderService.getOrderById(orderID);
            if (!order) {
                throw new Error('Order not found');
            }

            // Step 2: Check if cancellation is allowed
            if (order.status !== 'confirmed' && order.status !== 'pending') {
                throw new Error('This order cannot be cancelled');
            }

            // Step 3: Cancel the order
            const cancellationResult = await this.orderService.cancelOrder(orderID);
            if (!cancellationResult.success) {
                throw new Error(cancellationResult.message);
            }

            // Step 4: Cancel associated tickets
            const ticketItems = order.orderItems.filter(item => item.itemType === 'ticket');
            for (const item of ticketItems) {
                await this.ticketService.cancelTicket(item.itemID);
            }

            // Step 5: Process refund if payment was made
            let refundInfo = null;
            if (order.paymentStatus === 'paid') {
                const refundResult = await this.paymentService.processRefund(orderID);
                if (refundResult.success) {
                    refundInfo = {
                        amount: refundResult.refundAmount,
                        reference: refundResult.refundReference
                    };

                    // Adjust loyalty points
                    const pointsToDeduct = Math.floor(order.totalAmount);
                    await this.userService.deductLoyaltyPoints(currentUser.userID, pointsToDeduct);
                }
            }

            // Step 6: Send notification
            await this.notificationService.sendNotification({
                userID: currentUser.userID,
                type: 'booking_cancellation',
                title: 'Booking Cancelled',
                message: `Your booking has been cancelled successfully.${refundInfo ? ` Refund of $${refundInfo.amount.toFixed(2)} will be processed within 3-5 business days.` : ''}`
            });

            return {
                success: true,
                refundInfo: refundInfo
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getUserCancellableOrders(userID) {
        try {
            const orders = await this.orderService.getUserOrders(userID);
            return orders.filter(order => 
                order.status === 'confirmed' || order.status === 'pending'
            );
        } catch (error) {
            console.error('Error getting cancellable orders:', error);
            return [];
        }
    }
}
```

### 4. Admin Usage Statistics

**Files to Update**: `admin.html`, add new `admin-dashboard.js`

```javascript
// Create admin-dashboard.js
class AdminDashboard {
    constructor() {
        this.userService = new UserService();
        this.orderService = new OrderService();
        this.ticketService = new TicketService();
        this.merchandiseService = new MerchandiseService();
    }

    async generateStatistics() {
        try {
            const stats = {
                users: await this.getUserStatistics(),
                orders: await this.getOrderStatistics(),
                tickets: await this.getTicketStatistics(),
                merchandise: await this.getMerchandiseStatistics(),
                revenue: await this.getRevenueStatistics()
            };

            return {
                success: true,
                statistics: stats,
                generatedAt: new Date()
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getUserStatistics() {
        const users = await this.userService.getAllUsers();
        return {
            total: users.length,
            active: users.filter(user => user.isActive).length,
            averageLoyaltyPoints: users.reduce((sum, user) => sum + user.loyaltyPoints, 0) / users.length,
            newThisMonth: users.filter(user => {
                const registrationDate = new Date(user.dateRegistered);
                const now = new Date();
                return registrationDate.getMonth() === now.getMonth() && 
                       registrationDate.getFullYear() === now.getFullYear();
            }).length
        };
    }

    async getOrderStatistics() {
        const orders = await this.orderService.getAllOrders();
        const confirmedOrders = orders.filter(order => order.status === 'confirmed');
        const cancelledOrders = orders.filter(order => order.status === 'cancelled');
        
        return {
            total: orders.length,
            confirmed: confirmedOrders.length,
            cancelled: cancelledOrders.length,
            conversionRate: (confirmedOrders.length / orders.length * 100).toFixed(1),
            averageOrderValue: confirmedOrders.reduce((sum, order) => sum + order.totalAmount, 0) / confirmedOrders.length
        };
    }

    async getTicketStatistics() {
        const tickets = await this.ticketService.getAllTickets();
        
        // Analyze route popularity
        const routePopularity = {};
        tickets.forEach(ticket => {
            routePopularity[ticket.routeID] = (routePopularity[ticket.routeID] || 0) + 1;
        });

        const mostPopularRoute = Object.entries(routePopularity)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            total: tickets.length,
            active: tickets.filter(ticket => ticket.status === 'active').length,
            cancelled: tickets.filter(ticket => ticket.status === 'cancelled').length,
            mostPopularRoute: mostPopularRoute ? {
                routeID: mostPopularRoute[0],
                bookings: mostPopularRoute[1]
            } : null
        };
    }

    async getMerchandiseStatistics() {
        const merchandise = await this.merchandiseService.getAllMerchandise();
        
        return {
            totalProducts: merchandise.length,
            inStock: merchandise.filter(item => item.stockQuantity > 0).length,
            lowStock: merchandise.filter(item => item.stockQuantity > 0 && item.stockQuantity < 10).length,
            outOfStock: merchandise.filter(item => item.stockQuantity === 0).length
        };
    }

    async getRevenueStatistics() {
        const orders = await this.orderService.getAllOrders();
        const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
        
        const today = new Date();
        const thisMonth = paidOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.getMonth() === today.getMonth() && 
                   orderDate.getFullYear() === today.getFullYear();
        });

        const thisYear = paidOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.getFullYear() === today.getFullYear();
        });

        return {
            totalRevenue: paidOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            monthlyRevenue: thisMonth.reduce((sum, order) => sum + order.totalAmount, 0),
            yearlyRevenue: thisYear.reduce((sum, order) => sum + order.totalAmount, 0),
            averageOrderValue: paidOrders.reduce((sum, order) => sum + order.totalAmount, 0) / paidOrders.length
        };
    }
}
```

### 5. User Submit Feedback

**Files to Update**: Add feedback form to existing pages

```javascript
// Add to your main app.js
class FeedbackSystem {
    constructor() {
        this.feedbackService = new FeedbackService();
        this.userService = new UserService();
        this.notificationService = new NotificationService();
    }

    async submitFeedback(feedbackData) {
        try {
            const currentUser = this.userService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Please login to submit feedback');
            }

            const feedback = {
                userID: currentUser.userID,
                type: feedbackData.type || 'general',
                rating: parseInt(feedbackData.rating),
                subject: feedbackData.subject,
                message: feedbackData.message,
                category: feedbackData.category || 'general'
            };

            const result = await this.feedbackService.submitFeedback(feedback);

            if (result.success) {
                // Award loyalty points for feedback
                await this.userService.addLoyaltyPoints(currentUser.userID, 5);

                // Send acknowledgment
                await this.notificationService.sendNotification({
                    userID: currentUser.userID,
                    type: 'feedback_acknowledgment',
                    title: 'Feedback Received',
                    message: 'Thank you for your feedback! We appreciate your input.'
                });

                return {
                    success: true,
                    feedbackID: result.feedbackID
                };
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// HTML for feedback form (add to any page)
const feedbackFormHTML = `
<div id="feedbackModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Submit Feedback</h2>
        <form id="feedbackForm">
            <div class="form-group">
                <label for="feedbackRating">Rating:</label>
                <select id="feedbackRating" required>
                    <option value="">Select Rating</option>
                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                    <option value="4">⭐⭐⭐⭐ Good</option>
                    <option value="3">⭐⭐⭐ Average</option>
                    <option value="2">⭐⭐ Poor</option>
                    <option value="1">⭐ Very Poor</option>
                </select>
            </div>
            <div class="form-group">
                <label for="feedbackSubject">Subject:</label>
                <input type="text" id="feedbackSubject" required>
            </div>
            <div class="form-group">
                <label for="feedbackMessage">Message:</label>
                <textarea id="feedbackMessage" rows="5" required></textarea>
            </div>
            <div class="form-group">
                <label for="feedbackCategory">Category:</label>
                <select id="feedbackCategory">
                    <option value="general">General</option>
                    <option value="booking">Booking</option>
                    <option value="payment">Payment</option>
                    <option value="customer_service">Customer Service</option>
                    <option value="technical">Technical Issue</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Submit Feedback</button>
        </form>
    </div>
</div>
`;
```

### 6. Merchandise Purchase

**Files to Update**: `merchandise.html`, update existing merchandise functionality

```javascript
// Add to your merchandise.js or app.js
class MerchandiseShop {
    constructor() {
        this.merchandiseService = new MerchandiseService();
        this.orderService = new OrderService();
        this.paymentService = new PaymentService();
        this.userService = new UserService();
        this.currentOrder = null;
    }

    async addToCart(merchandiseId, quantity = 1) {
        try {
            const currentUser = this.userService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Please login to add items to cart');
            }

            // Create order if it doesn't exist
            if (!this.currentOrder) {
                const orderResult = await this.orderService.createOrder(currentUser.userID);
                if (orderResult.success) {
                    this.currentOrder = orderResult.orderID;
                } else {
                    throw new Error('Failed to create order');
                }
            }

            // Get merchandise details
            const merchandise = await this.merchandiseService.getMerchandiseById(merchandiseId);
            if (!merchandise) {
                throw new Error('Product not found');
            }

            // Check stock
            if (merchandise.stockQuantity < quantity) {
                throw new Error('Insufficient stock');
            }

            // Add to order
            const itemData = {
                itemType: 'merchandise',
                itemID: merchandiseId,
                quantity: quantity,
                unitPrice: merchandise.price
            };

            const result = await this.orderService.addItemToOrder(this.currentOrder, itemData);
            
            if (result.success) {
                this.updateCartDisplay();
                return {
                    success: true,
                    message: `${merchandise.name} added to cart!`
                };
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async checkout() {
        try {
            if (!this.currentOrder) {
                throw new Error('No items in cart');
            }

            const orderSummary = await this.orderService.getOrderSummary(this.currentOrder);
            
            if (orderSummary.success) {
                return {
                    success: true,
                    orderSummary: orderSummary.order
                };
            } else {
                throw new Error('Failed to get order summary');
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async processPayment(paymentDetails) {
        try {
            const paymentResult = await this.paymentService.processPayment({
                orderID: this.currentOrder,
                amount: paymentDetails.amount,
                paymentMethod: paymentDetails.method,
                cardDetails: paymentDetails.cardDetails
            });

            if (paymentResult.success) {
                // Update order status
                await this.orderService.updateOrderStatus(this.currentOrder, 'confirmed');
                
                // Update inventory
                const order = await this.orderService.getOrderById(this.currentOrder);
                for (const item of order.orderItems) {
                    if (item.itemType === 'merchandise') {
                        await this.merchandiseService.updateStock(item.itemID, -item.quantity);
                    }
                }

                // Award loyalty points
                const currentUser = this.userService.getCurrentUser();
                const pointsAwarded = Math.floor(paymentDetails.amount * 0.1);
                await this.userService.addLoyaltyPoints(currentUser.userID, pointsAwarded);

                // Clear current order
                this.currentOrder = null;
                this.updateCartDisplay();

                return {
                    success: true,
                    transactionID: paymentResult.transactionID,
                    pointsAwarded: pointsAwarded
                };
            } else {
                throw new Error(paymentResult.message);
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}
```

## Integration Steps

1. **Update your imports**: Add service imports to your existing JavaScript files
2. **Replace direct model usage**: Use services instead of manipulating models directly
3. **Add error handling**: Implement proper try-catch blocks and user feedback
4. **Update UI components**: Modify forms and buttons to use the new service methods
5. **Test scenarios**: Use the demo page to verify everything works correctly

## Next Steps

1. Open `demo-scenarios.html` to see all scenarios in action
2. Study the code patterns in `complete-user-scenarios.js`
3. Update your existing files using the patterns shown above
4. Test each scenario individually
5. Implement additional error handling and user feedback as needed

## Key Benefits

- **Separation of Concerns**: Business logic in services, presentation in UI
- **Reusability**: Services can be used across multiple components
- **Testability**: Services can be easily unit tested
- **Maintainability**: Changes to business logic only require service updates
- **Consistency**: Standardized patterns across all features
