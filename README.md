# Kuching ART Online System

[![Node.js CI](https://github.com/Josan88/Kuching-ART-Online-System/actions/workflows/node.js.yml/badge.svg)](https://github.com/Josan88/Kuching-ART-Online-System/actions/workflows/node.js.yml)

A comprehensive client-side JavaScript transportation booking and merchandise management system for Kuching Autonomous Rapid Transit (ART) services.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Classes Overview](#-classes-overview)
- [Contributing](#-contributing)
- [Assignment Information](#-assignment-information)

## 🚌 Overview

The Kuching ART Online System is a client-side web application built with vanilla JavaScript that provides:
- **Transportation Services**: Route management, ticket booking, and schedule tracking
- **E-Commerce Platform**: Merchandise catalog, inventory management, and online sales
- **User Management**: Authentication, profiles, and loyalty programs using localStorage
- **Administrative Tools**: Order processing, feedback management, and analytics
- **Communication System**: Notification management and customer feedback

All data is stored locally using the browser's localStorage API, making this a fully client-side application.

## ✨ Features

### 🎫 Transportation Services
- **Route Management**: Comprehensive route planning with origin/destination tracking
- **Ticket Booking**: Seat availability and reservation system
- **Schedule Management**: Timetables with departure/arrival tracking
- **Price Calculation**: Distance-based and time-sensitive pricing

### 🛒 E-Commerce Platform
- **Product Catalog**: Multi-category merchandise with filtering capabilities
- **Inventory Control**: Stock tracking with low-stock alerts
- **Shopping Cart**: Persistent cart using localStorage
- **Stock Reservation**: Temporary holds during checkout process

### 💳 Payment Processing
- **Multi-Gateway Support**: Credit card, debit card, PayPal, bank transfer, e-wallet
- **Security Features**: Luhn algorithm validation for card numbers
- **Transaction Management**: Refunds, partial payments, and transaction history
- **Fee Calculation**: Dynamic fee structure based on payment method

### 👥 User Management
- **Authentication System**: Login/registration with localStorage session management
- **Role-Based Access**: User and Admin roles with appropriate permissions
- **Profile Management**: User profiles with preferences stored locally
- **Loyalty Program**: Points-based rewards system (1 point per RM spent)

### 📊 Analytics & Reporting
- **Sales Statistics**: Revenue tracking and product performance analysis
- **User Analytics**: Registration trends and activity patterns
- **Inventory Reports**: Stock levels and turnover rates
- **Financial Reports**: Payment statistics and fee analysis

### 💬 Communication System
- **Notification Management**: In-app notification system
- **Feedback Management**: Customer reviews, ratings, and complaint handling
- **Admin Responses**: Direct communication with customer support
- **System Alerts**: Notifications for important events

## 🏗️ Architecture

### Design Patterns
- **Model-View-Controller (MVC)**: Clear separation of concerns
- **Service Layer Pattern**: Business logic abstraction
- **Repository Pattern**: Data access abstraction using DataService
- **Observer Pattern**: Event-driven notifications

### Key Architectural Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   View Layer    │────│ Service Layer   │────│  Model Layer    │
│                 │    │                 │    │                 │
│ • HTML/CSS      │    │ • Business Logic│    │ • Data Models   │
│ • DOM Events    │    │ • Validations   │    │ • Entities      │
│ • User Interface│    │ • Workflows     │    │ • Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │  Data Layer     │
                       │                 │
                       │ • localStorage  │
                       │ • DataService   │
                       └─────────────────┘
```

## 📁 Project Structure

```
Kuching-ART-Online-System/
├── index.html                 # Main application entry point
├── README.md                  # Project documentation
├── js/
│   ├── models/               # Data models and entities
│   │   ├── User.js          # User entity with authentication
│   │   ├── Admin.js         # Admin entity (extends User)
│   │   ├── Route.js         # Transportation route model
│   │   ├── Ticket.js        # Ticket booking model
│   │   ├── Merchandise.js   # Product catalog model
│   │   ├── Order.js         # Order management model
│   │   ├── OrderItem.js     # Individual order items
│   │   ├── Payment.js       # Payment transaction model
│   │   ├── Feedback.js      # Customer feedback model
│   │   ├── PointsLedger.js  # Loyalty points tracking
│   │   └── Notification.js  # System notifications
│   │
│   └── services/            # Business logic and services
│       ├── DataService.js      # localStorage abstraction
│       ├── UserService.js      # User management and authentication
│       ├── TicketService.js    # Ticket booking operations
│       ├── OrderService.js     # Order processing workflows
│       ├── PaymentService.js   # Payment processing and validation
│       ├── MerchandiseService.js # Product catalog and inventory
│       ├── FeedbackService.js  # Customer feedback management
│       └── NotificationService.js # Communication and alerts
```

## 🚀 Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge) with localStorage support
- No server or database required - this is a client-side only application

### Setup Instructions

1. **Clone or Download** the project files to your local machine

2. **Open the project** in your preferred code editor

3. **Launch the application**:
   - **Option A**: Open `index.html` directly in your browser by double-clicking
   - **Option B**: Use a local development server for development
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server
     
     # Using Live Server (VS Code extension)
     # Right-click index.html → "Open with Live Server"
     ```

4. **Access the application** at `http://localhost:8000` (if using a server) or directly via file:// protocol

## 📖 Usage

### For End Users

#### 1. User Registration & Login
```javascript
// Example user registration
const dataService = new DataService();
const userService = new UserService(dataService);

const result = userService.register({
    name: "John Doe",
    email: "john@example.com",
    password: "securePassword123",
    phone: "+60123456789"
});

if (result.success) {
    console.log("Registration successful!");
}
```

#### 2. Booking Tickets
```javascript
// Example ticket booking
const ticketService = new TicketService(dataService);
const booking = ticketService.bookTicket({
    routeId: "route_001",
    userId: "user_123",
    departureTime: "2025-06-15T08:00:00Z",
    seatNumbers: ["A1", "A2"],
    passengerCount: 2
});

if (booking.success) {
    console.log("Ticket booked successfully!");
}
```

#### 3. Shopping for Merchandise
```javascript
// Example merchandise browsing
const merchandiseService = new MerchandiseService(dataService);
const products = merchandiseService.getAllMerchandise({
    category: "souvenirs",
    minPrice: 10,
    maxPrice: 100,
    inStock: true,
    page: 1,
    limit: 20
});
```

#### 4. Making Payments
```javascript
// Example payment processing
const paymentService = new PaymentService(dataService);
const payment = paymentService.processPayment({
    method: "credit_card",
    cardNumber: "4111111111111111",
    expiryMonth: "12",
    expiryYear: "2027",
    cvv: "123",
    cardholderName: "John Doe"
}, orderId);

if (payment.success) {
    console.log("Payment processed successfully!");
}
```

### For Administrators

#### 1. Managing Inventory
```javascript
// Check low stock items
const lowStockItems = merchandiseService.getLowStockItems(10);

// Get sales statistics
const stats = merchandiseService.getSalesStatistics({
    startDate: "2025-01-01",
    endDate: "2025-12-31"
});
```

#### 2. Handling Feedback
```javascript
// Get pending feedback
const feedbackService = new FeedbackService(dataService);
const feedback = feedbackService.getAllFeedback({
    status: "pending",
    priority: "high"
});

// Respond to feedback
feedbackService.addFeedbackResponse(
    feedbackId, 
    "Thank you for your feedback. We're addressing this issue.",
    adminId
);
```

## 📚 API Documentation

### Core Services

#### DataService
**Purpose**: Provides persistent data storage using localStorage for all application data.

**Key Methods**:
- `saveData(key, data)` - Save data to localStorage
- `loadData(key)` - Load data from localStorage  
- `deleteData(key)` - Delete data from localStorage
- `getAllKeys()` - Get all storage keys
- `clearAll()` - Clear all stored data
- `exportData()` - Export all data to JSON
- `importData(data)` - Import data from JSON
- `getStorageInfo()` - Get storage usage statistics

#### UserService
**Purpose**: Manages user authentication, registration, and profile management.

**Key Methods**:
- `register(userData)` - Register new user, returns {success, message, user}
- `login(email, password)` - Authenticate user, returns {success, message, user}
- `updateProfile(userId, profileData)` - Update user profile
- `changePassword(userId, oldPassword, newPassword)` - Change password
- `getCurrentUser()` - Get currently logged-in user
- `logout()` - Clear current session

#### MerchandiseService
**Purpose**: Handles product catalog, inventory management, and stock operations.

**Key Methods**:
- `getAllMerchandise(options)` - Get products with filtering/pagination
- `getMerchandiseById(id)` - Get single product details
- `checkStockAvailability(items)` - Verify stock for multiple items
- `reserveStock(items, reservationId)` - Temporarily hold stock
- `searchMerchandise(query, filters)` - Advanced product search
- `getLowStockItems(threshold)` - Get items below stock threshold

#### PaymentService
**Purpose**: Processes payments, handles refunds, and manages transaction records.

**Key Methods**:
- `processPayment(paymentData, orderId)` - Process payment transaction
- `refundPayment(paymentId, amount)` - Process refund
- `getPaymentHistory(userId, options)` - Get user payment history
- `validatePaymentData(paymentData)` - Validate payment information
- `calculatePaymentFees(method, amount)` - Calculate processing fees

### Data Models

#### User Model
```javascript
{
    id: "user_001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+60123456789",
    role: "user", // "user" | "admin"
    loyaltyPoints: 150,
    profileComplete: true,
    status: "active",
    createdAt: "2025-06-01T10:00:00Z",
    lastLogin: "2025-06-15T08:30:00Z"
}
```

#### Merchandise Model
```javascript
{
    id: "merch_001",
    name: "Kuching ART T-Shirt",
    description: "Official ART branded t-shirt",
    category: "apparel",
    price: 35.00,
    stockQuantity: 100,
    soldQuantity: 25,
    tags: ["clothing", "official", "cotton"],
    featured: true,
    images: ["shirt1.jpg", "shirt2.jpg"],
    createdAt: "2025-05-01T00:00:00Z"
}
```

#### Order Model
```javascript
{
    id: "order_001",
    userId: "user_001",
    items: [
        {
            merchandiseId: "merch_001", 
            quantity: 2, 
            price: 35.00
        }
    ],
    totalAmount: 70.00,
    status: "pending", // "pending" | "paid" | "shipped" | "delivered"
    shippingAddress: {
        street: "123 Main St",
        city: "Kuching",
        state: "Sarawak",
        postalCode: "93100"
    },
    createdAt: "2025-06-01T14:30:00Z"
}
```

## 🔧 Classes Overview

### Model Classes (11 classes)

| Class | Purpose | Key Features |
|-------|---------|--------------|
| **User** | User entity management | Authentication, profile, loyalty points |
| **Admin** | Administrator entity (extends User) | Enhanced permissions, admin operations |
| **Route** | Transportation route data | Origin/destination, schedule, pricing |
| **Ticket** | Booking and reservation | Seat management, passenger details |
| **Merchandise** | Product catalog items | Inventory, pricing, categorization |
| **Order** | Purchase order management | Shopping cart, order lifecycle |
| **OrderItem** | Individual order components | Quantity, pricing, product linking |
| **Payment** | Transaction processing | Payment methods, fees, refunds |
| **Feedback** | Customer feedback system | Ratings, reviews, admin responses |
| **PointsLedger** | Loyalty points tracking | Earning/spending history |
| **Notification** | System messaging | Message delivery, scheduling |

### Service Classes (8 classes)

| Service | Responsibility | Integration Points |
|---------|---------------|-------------------|
| **DataService** | localStorage abstraction | All other services |
| **UserService** | User management & authentication | OrderService, NotificationService |
| **TicketService** | Transportation booking | UserService, PaymentService |
| **OrderService** | E-commerce order processing | MerchandiseService, PaymentService |
| **PaymentService** | Financial transaction processing | OrderService, TicketService |
| **MerchandiseService** | Product & inventory management | OrderService |
| **FeedbackService** | Customer feedback management | UserService, NotificationService |
| **NotificationService** | Communication & messaging | All services (for alerts) |

### Key Object-Oriented Principles

#### 1. Encapsulation
- Private data and public interfaces in all classes
- Getter/setter methods for controlled access
- Internal validation and business rules

#### 2. Inheritance
- `Admin` class extends `User` class
- Shared functionality with specialized behavior
- Method overriding for admin-specific operations

#### 3. Polymorphism
- Multiple payment methods with unified interface
- Different notification types with common API
- Flexible data storage implementation

#### 4. Abstraction
- Service layer abstracts business logic from data storage
- Models provide clean interfaces to complex data structures
- DataService abstracts localStorage implementation details

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow consistent JavaScript ES6+ conventions
2. **Documentation**: Maintain comprehensive JSDoc comments
3. **Testing**: Validate all service methods with sample data
4. **Error Handling**: Implement robust try-catch blocks
5. **Validation**: Ensure input validation in all public methods

### Adding New Features

1. **Model Changes**: Update relevant model classes first
2. **Service Logic**: Implement business logic in appropriate service
3. **Integration**: Update dependent services and methods
4. **Testing**: Test with localStorage data
5. **Documentation**: Update README and inline documentation

### Code Quality Standards

- **Naming**: Use descriptive, camelCase naming conventions
- **Functions**: Keep methods focused and under 50 lines when possible
- **Comments**: Explain complex business logic and algorithms
- **Error Messages**: Provide clear, actionable error messages
- **Performance**: Consider efficiency in localStorage operations

## 📋 Assignment Information

### Course Details
- **Course**: SWE30003 Software Architecture and Design
- **Assignment**: Assignment 3 - Object-Oriented Design (Part II)
- **Institution**: Swinburne University of Technology Sarawak
- **Author**: Jason
- **Academic Year**: 2025

### Assignment Objectives
1. **Object-Oriented Design**: Implement comprehensive class hierarchies
2. **Design Patterns**: Apply appropriate software design patterns
3. **Business Logic**: Create realistic business process workflows
4. **Data Management**: Implement effective data persistence using localStorage
5. **Integration**: Demonstrate inter-class communication and dependencies

### Technical Requirements Met
- ✅ **Class Design**: 19 classes with proper OOP principles
- ✅ **Inheritance**: Admin extends User with method overriding
- ✅ **Encapsulation**: Private data with controlled access methods
- ✅ **Polymorphism**: Multiple implementations of common interfaces
- ✅ **Abstraction**: Service layer abstracting business logic
- ✅ **Design Patterns**: MVC, Repository, Observer patterns implemented
- ✅ **Error Handling**: Comprehensive validation and error management
- ✅ **Documentation**: Detailed JSDoc and README documentation
- ✅ **Client-Side Storage**: localStorage for data persistence

### Features Implemented
- 🎫 **Transportation Booking System** with seat availability
- 🛒 **E-Commerce Platform** with inventory management
- 💳 **Payment Processing** with validation and fee calculation
- 👥 **User Management** with role-based access control
- 📊 **Analytics Dashboard** with comprehensive reporting
- 💬 **Communication System** with notification management
- 🎯 **Loyalty Program** with points and rewards
- 💾 **Local Storage**: Complete client-side data persistence
- 🔒 **Security**: Input validation and secure authentication

---

## 📞 Support

For questions, issues, or contributions related to this project:

- **Academic Queries**: Contact course instructor or teaching assistants
- **Technical Issues**: Review the code documentation and error handling
- **Feature Requests**: Consider the assignment scope and requirements
- **Browser Compatibility**: Ensure localStorage support is enabled

---

**© 2025 Kuching ART Online System - Assignment 3 SWE30003**
