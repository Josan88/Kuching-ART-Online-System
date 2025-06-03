/**
 * Demo Data Initialization Script
 * Sets up sample data for testing all six scenarios
 */

// Sample users for testing
const sampleUsers = [
    {
        userID: 'demo_user_1',
        userName: 'John Doe',
        email: 'test@example.com',
        password: 'password123', // In real app, this would be hashed
        phoneNumber: '+60123456789',
        address: '123 Kuching Street, Sarawak, Malaysia',
        loyaltyPoints: 150,
        registrationDate: new Date('2024-01-15').toISOString(),
        isAdmin: false
    },
    {
        userID: 'demo_admin_1',
        userName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        phoneNumber: '+60987654321',
        address: 'Admin Office, Kuching, Sarawak',
        loyaltyPoints: 500,
        registrationDate: new Date('2024-01-01').toISOString(),
        isAdmin: true
    }
];

// Sample routes
const sampleRoutes = [
    {
        routeID: 'route_1',
        startLocation: 'Kuching Central',
        endLocation: 'Kuching Airport',
        distance: 12.5,
        duration: 25,
        price: 5.00,
        departureTime: '08:00',
        arrivalTime: '08:25',
        isActive: true
    },
    {
        routeID: 'route_2',
        startLocation: 'Pending Station',
        endLocation: 'Satok Bridge',
        distance: 8.2,
        duration: 18,
        price: 3.50,
        departureTime: '09:00',
        arrivalTime: '09:18',
        isActive: true
    },
    {
        routeID: 'route_3',
        startLocation: 'Kuching Central',
        endLocation: 'Pending Station',
        distance: 6.8,
        duration: 15,
        price: 3.00,
        departureTime: '10:00',
        arrivalTime: '10:15',
        isActive: true
    }
];

// Sample merchandise
const sampleMerchandise = [
    {
        merchandiseID: 'merch_1',
        name: 'Kuching ART T-Shirt',
        description: 'Official Kuching ART branded t-shirt made from premium cotton',
        price: 25.00,
        category: 'clothing',
        stockQuantity: 50,
        imageURL: 'https://via.placeholder.com/250x200/3498db/ffffff?text=ART+T-Shirt',
        isActive: true
    },
    {
        merchandiseID: 'merch_2',
        name: 'ART Coffee Mug',
        description: 'Ceramic coffee mug with ART logo, perfect for your morning coffee',
        price: 12.00,
        category: 'accessories',
        stockQuantity: 30,
        imageURL: 'https://via.placeholder.com/250x200/e74c3c/ffffff?text=Coffee+Mug',
        isActive: true
    },
    {
        merchandiseID: 'merch_3',
        name: 'Kuching Keychain',
        description: 'Souvenir keychain featuring Kuching landmarks and ART branding',
        price: 8.00,
        category: 'souvenirs',
        stockQuantity: 100,
        imageURL: 'https://via.placeholder.com/250x200/2ecc71/ffffff?text=Keychain',
        isActive: true
    },
    {
        merchandiseID: 'merch_4',
        name: 'ART Water Bottle',
        description: 'Eco-friendly water bottle with ART logo',
        price: 15.00,
        category: 'accessories',
        stockQuantity: 25,
        imageURL: 'https://via.placeholder.com/250x200/9b59b6/ffffff?text=Water+Bottle',
        isActive: true
    }
];

// Sample orders (for statistics)
const sampleOrders = [
    {
        orderID: 'order_1',
        userID: 'demo_user_1',
        items: [
            { merchandiseID: 'merch_1', quantity: 2, price: 25.00 },
            { merchandiseID: 'merch_2', quantity: 1, price: 12.00 }
        ],
        totalAmount: 62.00,
        orderDate: new Date('2024-12-01').toISOString(),
        status: 'completed'
    }
];

// Sample tickets (for statistics)
const sampleTickets = [
    {
        ticketID: 'ticket_1',
        userID: 'demo_user_1',
        routeID: 'route_1',
        departureDate: '2024-12-15',
        departureTime: '08:00',
        passengerCount: 1,
        totalAmount: 5.00,
        bookingDate: new Date('2024-12-01').toISOString(),
        status: 'active'
    }
];

// Sample feedback
const sampleFeedback = [
    {
        feedbackID: 'feedback_1',
        userID: 'demo_user_1',
        rating: 5,
        category: 'service',
        comment: 'Excellent service and very convenient booking system!',
        submissionDate: new Date('2024-12-01').toISOString()
    }
];

/**
 * Initialize demo data in localStorage
 */
function initializeDemoData() {
    try {
        // Clear existing data
        localStorage.removeItem('kart_users');
        localStorage.removeItem('kart_routes');
        localStorage.removeItem('kart_merchandise');
        localStorage.removeItem('kart_orders');
        localStorage.removeItem('kart_tickets');
        localStorage.removeItem('kart_feedback');
        localStorage.removeItem('kart_payments');

        // Set sample data
        localStorage.setItem('kart_users', JSON.stringify(sampleUsers));
        localStorage.setItem('kart_routes', JSON.stringify(sampleRoutes));
        localStorage.setItem('kart_merchandise', JSON.stringify(sampleMerchandise));
        localStorage.setItem('kart_orders', JSON.stringify(sampleOrders));
        localStorage.setItem('kart_tickets', JSON.stringify(sampleTickets));
        localStorage.setItem('kart_feedback', JSON.stringify(sampleFeedback));
        localStorage.setItem('kart_payments', JSON.stringify([]));

        console.log('✅ Demo data initialized successfully!');
        console.log('📊 Available test accounts:');
        console.log('   Regular User: test@example.com / password123');
        console.log('   Admin User: admin@example.com / admin123');
        
        return true;
    } catch (error) {
        console.error('❌ Error initializing demo data:', error);
        return false;
    }
}

/**
 * Clear all demo data
 */
function clearDemoData() {
    try {
        localStorage.removeItem('kart_users');
        localStorage.removeItem('kart_routes');
        localStorage.removeItem('kart_merchandise');
        localStorage.removeItem('kart_orders');
        localStorage.removeItem('kart_tickets');
        localStorage.removeItem('kart_feedback');
        localStorage.removeItem('kart_payments');
        localStorage.removeItem('kart_session');
        
        console.log('🗑️ Demo data cleared successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error clearing demo data:', error);
        return false;
    }
}

/**
 * Display current data statistics
 */
function showDataStatistics() {
    const stats = {
        users: JSON.parse(localStorage.getItem('kart_users') || '[]').length,
        routes: JSON.parse(localStorage.getItem('kart_routes') || '[]').length,
        merchandise: JSON.parse(localStorage.getItem('kart_merchandise') || '[]').length,
        orders: JSON.parse(localStorage.getItem('kart_orders') || '[]').length,
        tickets: JSON.parse(localStorage.getItem('kart_tickets') || '[]').length,
        feedback: JSON.parse(localStorage.getItem('kart_feedback') || '[]').length
    };

    console.log('📈 Current Data Statistics:');
    console.log(`   Users: ${stats.users}`);
    console.log(`   Routes: ${stats.routes}`);
    console.log(`   Merchandise: ${stats.merchandise}`);
    console.log(`   Orders: ${stats.orders}`);
    console.log(`   Tickets: ${stats.tickets}`);
    console.log(`   Feedback: ${stats.feedback}`);

    return stats;
}

// Export functions for use in console or other scripts
window.demoData = {
    init: initializeDemoData,
    clear: clearDemoData,
    stats: showDataStatistics,
    samples: {
        users: sampleUsers,
        routes: sampleRoutes,
        merchandise: sampleMerchandise,
        orders: sampleOrders,
        tickets: sampleTickets,
        feedback: sampleFeedback
    }
};

// Auto-initialize demo data when script loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDemoData();
});

console.log('🚀 Demo data script loaded!');
console.log('💡 Available commands:');
console.log('   window.demoData.init() - Initialize demo data');
console.log('   window.demoData.clear() - Clear all data');
console.log('   window.demoData.stats() - Show data statistics');
