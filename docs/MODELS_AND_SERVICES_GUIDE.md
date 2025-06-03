# Kuching ART Online System - Models and Services Usage Guide

## Overview

This guide explains how to effectively use the models and services in the Kuching ART Online System. The system follows a layered architecture with clear separation between data models and business logic services.

## Architecture

```
┌─────────────────┐
│   Presentation  │  ← HTML, CSS, UI Components
│     Layer       │
├─────────────────┤
│   Application   │  ← app.js, Controllers
│     Layer       │
├─────────────────┤
│   Service       │  ← Business Logic Services
│     Layer       │
├─────────────────┤
│   Model         │  ← Data Models
│     Layer       │
├─────────────────┤
│   Data          │  ← DataService, Local Storage
│     Layer       │
└─────────────────┘
```

## Models

Models represent the core data structures and business entities in the system.

### User Model (`/js/models/User.js`)

**Purpose**: Represents a system user with authentication and profile management capabilities.

**Key Properties**:
- `userID`: Unique identifier
- `userName`: Display name
- `email`: Login email
- `password`: User password (should be hashed in production)
- `phoneNumber`: Contact number
- `address`: User address
- `loyaltyPoints`: Accumulated loyalty points

**Key Methods**:
```javascript
// Validate login credentials
user.validateCredentials(email, password)

// Update user profile
user.updateProfile({userName: 'New Name', address: 'New Address'})

// Add loyalty points
user.addLoyaltyPoints(50)

// Deduct loyalty points
user.deductLoyaltyPoints(25)
```

**Usage Example**:
```javascript
import User from './models/User.js';

// Create a new user
const user = new User(
    'user_001',
    'John Doe',
    'john@example.com',
    'password123',
    '+60123456789',
    '123 Main St, Kuching'
);

// Validate credentials
if (user.validateCredentials('john@example.com', 'password123')) {
    console.log('Login successful');
}
```

### Order Model (`/js/models/Order.js`)

**Purpose**: Represents a customer order containing multiple items.

**Key Properties**:
- `orderID`: Unique identifier
- `userID`: Associated user
- `orderItems`: Array of OrderItem objects
- `status`: Order status (pending, confirmed, processing, completed, cancelled, refunded)
- `paymentStatus`: Payment status (unpaid, paid, failed, refunded)
- `totalAmount`: Calculated total

**Key Methods**:
```javascript
// Add item to order
order.addItem(orderItem)

// Remove item from order
order.removeItem(itemId)

// Calculate totals
order.calculateTotals()

// Update order status
order.updateStatus('confirmed')
```

### Ticket Model (`/js/models/Ticket.js`)

**Purpose**: Represents a booked ticket for the ART system.

**Key Properties**:
- `ticketID`: Unique identifier
- `userID`: Associated user
- `routeID`: Selected route
- `departureDate`: Travel date
- `passengers`: Array of passenger information
- `totalPrice`: Total ticket price

### Merchandise Model (`/js/models/Merchandise.js`)

**Purpose**: Represents merchandise items available for purchase.

**Key Properties**:
- `merchandiseID`: Unique identifier
- `name`: Product name
- `description`: Product description
- `price`: Unit price
- `category`: Product category
- `stockQuantity`: Available quantity

## Services

Services contain business logic and handle interactions between models and data persistence.

### UserService (`/js/services/UserService.js`)

**Purpose**: Manages user-related operations including authentication and profile management.

**Key Methods**:

#### User Registration
```javascript
const userService = new UserService();

const registrationResult = await userService.registerUser({
    userName: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
    phoneNumber: '+60123456789',
    address: '123 Main St, Kuching'
});

if (registrationResult.success) {
    console.log('User registered:', registrationResult.userID);
}
```

#### User Authentication
```javascript
const loginResult = await userService.loginUser('john@example.com', 'password123');

if (loginResult.success) {
    const currentUser = userService.getCurrentUser();
    console.log('Logged in as:', currentUser.userName);
}
```

#### Profile Management
```javascript
const updateResult = await userService.updateUserProfile(userID, {
    userName: 'John Smith',
    phoneNumber: '+60987654321'
});
```

#### Loyalty Points
```javascript
// Add points
await userService.addLoyaltyPoints(userID, 50);

// Get loyalty info
const loyaltyInfo = await userService.getLoyaltyPointsInfo(userID);
```

### OrderService (`/js/services/OrderService.js`)

**Purpose**: Manages order creation, modification, and processing.

**Key Methods**:

#### Create Order
```javascript
const orderService = new OrderService();

const orderResult = await orderService.createOrder(userID);
if (orderResult.success) {
    const orderID = orderResult.orderID;
}
```

#### Add Items to Order
```javascript
const itemData = {
    itemType: 'merchandise',
    itemID: 'merch_001',
    quantity: 2,
    unitPrice: 29.99
};

await orderService.addItemToOrder(orderID, itemData);
```

#### Process Order
```javascript
// Get order summary
const summary = await orderService.getOrderSummary(orderID);

// Update order status
await orderService.updateOrderStatus(orderID, 'confirmed');

// Cancel order
const cancellationResult = await orderService.cancelOrder(orderID);
```

### TicketService (`/js/services/TicketService.js`)

**Purpose**: Manages ticket booking and route information.

**Key Methods**:

#### Get Available Routes
```javascript
const ticketService = new TicketService();
const routes = await ticketService.getAvailableRoutes();
```

#### Book Tickets
```javascript
const bookingData = {
    routeID: 'route_001',
    departureDate: '2025-06-15',
    departureTime: '09:00',
    passengers: [
        { name: 'John Doe', type: 'adult', price: 25.00 },
        { name: 'Jane Doe', type: 'child', price: 15.00 }
    ]
};

const bookingResult = await ticketService.bookTicket(userID, bookingData);
```

### PaymentService (`/js/services/PaymentService.js`)

**Purpose**: Handles payment processing and financial transactions.

**Key Methods**:

#### Process Payment
```javascript
const paymentService = new PaymentService();

const paymentData = {
    orderID: 'order_001',
    amount: 99.98,
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
```

#### Process Refund
```javascript
const refundResult = await paymentService.processRefund(orderID);
```

## Integration Patterns

### 1. Service Layer Pattern

Always use services for business operations:

```javascript
// ❌ Don't access models directly
const user = new User(...);
localStorage.setItem('user', JSON.stringify(user));

// ✅ Use services
const userService = new UserService();
const result = await userService.registerUser(userData);
```

### 2. Dependency Injection

Services can depend on other services:

```javascript
class OrderService {
    constructor() {
        this.dataService = new DataService();
        this.paymentService = new PaymentService();
        this.notificationService = new NotificationService();
    }
}
```

### 3. Error Handling

Always handle errors gracefully:

```javascript
try {
    const result = await userService.loginUser(email, password);
    if (result.success) {
        // Handle success
    } else {
        // Handle business logic errors
        showErrorMessage(result.message);
    }
} catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    showErrorMessage('An unexpected error occurred');
}
```

### 4. Async Operations

Most service methods are asynchronous:

```javascript
// ✅ Always await service calls
const orders = await orderService.getUserOrders(userID);

// ✅ Handle promises properly
orderService.createOrder(userID)
    .then(result => console.log(result))
    .catch(error => console.error(error));
```

## Best Practices

### 1. Separation of Concerns
- **Models**: Data structure and basic validation
- **Services**: Business logic and data persistence
- **Controllers/App**: UI logic and user interaction

### 2. Error Handling
- Always check service result success flags
- Provide meaningful error messages to users
- Log detailed errors for debugging

### 3. State Management
- Use services to maintain application state
- Don't store business logic in UI components
- Keep models immutable when possible

### 4. Testing
- Test models independently
- Mock services in unit tests
- Test service integration separately

### 5. Performance
- Cache frequently accessed data in services
- Use lazy loading for expensive operations
- Implement pagination for large datasets

## Common Usage Scenarios

### 1. User Registration Flow
```javascript
// 1. Validate input
// 2. Register user
const result = await userService.registerUser(userData);
// 3. Handle result
// 4. Redirect to login
```

### 2. Shopping Cart Flow
```javascript
// 1. Create order
const order = await orderService.createOrder(userID);
// 2. Add items
await orderService.addItemToOrder(orderID, itemData);
// 3. Calculate totals
const summary = await orderService.getOrderSummary(orderID);
// 4. Process payment
const payment = await paymentService.processPayment(paymentData);
```

### 3. Ticket Booking Flow
```javascript
// 1. Get available routes
const routes = await ticketService.getAvailableRoutes();
// 2. Book tickets
const booking = await ticketService.bookTicket(userID, bookingData);
// 3. Create order for tickets
const order = await orderService.createOrder(userID);
// 4. Process payment
```

## File Structure

```
js/
├── models/
│   ├── User.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Ticket.js
│   ├── Merchandise.js
│   ├── Payment.js
│   ├── Route.js
│   ├── Admin.js
│   ├── Feedback.js
│   ├── Notification.js
│   └── PointsLedger.js
├── services/
│   ├── UserService.js
│   ├── OrderService.js
│   ├── TicketService.js
│   ├── MerchandiseService.js
│   ├── PaymentService.js
│   ├── FeedbackService.js
│   ├── NotificationService.js
│   └── DataService.js
├── app.js (Main application)
└── booking.js (Booking-specific logic)
```

## Next Steps

1. Review the example files created:
   - `/examples/usage-examples.js` - Complete usage examples
   - `/js/app-with-services.js` - Updated application with service integration

2. Update your existing `app.js` file to use the service pattern shown in the examples

3. Test the integration by running the application and verifying that:
   - User registration and login work
   - Order creation and management function properly
   - Payment processing operates correctly
   - Error handling provides appropriate feedback

4. Consider adding additional features:
   - Input validation
   - Loading states
   - Better error messaging
   - Data caching
   - Offline support
