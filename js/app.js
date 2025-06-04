// Kuching ART Online System - Integrated Application with All Six Scenarios

// Import all necessary services
import UserService from './services/UserService.js';
import OrderService from './services/OrderService.js';
import TicketService from './services/TicketService.js';
import PaymentService from './services/PaymentService.js';
import MerchandiseService from './services/MerchandiseService.js';
import FeedbackService from './services/FeedbackService.js';
import NotificationService from './services/NotificationService.js';
import DataService from './services/DataService.js';

class KuchingARTApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'home';
        this.cart = [];
        this.ticketBookings = [];
        this.adminData = null;

        // Initialize data service first
        this.dataService = new DataService();

        // Initialize services with dataService
        this.userService = new UserService();
        this.orderService = new OrderService();
        this.ticketService = new TicketService();
        this.paymentService = new PaymentService();
        this.merchandiseService = new MerchandiseService(this.dataService);
        this.feedbackService = new FeedbackService(this.dataService);
        this.notificationService = new NotificationService();

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateUI();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.addEventListener('click', () => this.showModal('loginModal'));
        if (registerBtn) registerBtn.addEventListener('click', () => this.showModal('registerModal'));
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

        // Hero buttons
        const bookTicketBtn = document.querySelector('[data-testid="book-ticket-btn"]');
        const browseMerchandiseBtn = document.querySelector('[data-testid="browse-merchandise-btn"]');

        if (bookTicketBtn) bookTicketBtn.addEventListener('click', () => this.showSection('routes'));
        if (browseMerchandiseBtn) browseMerchandiseBtn.addEventListener('click', () => this.showSection('merchandise'));

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // Forms
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const ticketBookingForm = document.getElementById('ticketBookingForm');

        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        if (registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        if (ticketBookingForm) ticketBookingForm.addEventListener('submit', (e) => this.handleTicketSearch(e));        // Merchandise filters
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) {
            console.log('Setting up category filter event listener');
            // Remove existing listeners to avoid duplicates
            categoryFilter.removeEventListener('change', this.filterMerchandise.bind(this));
            categoryFilter.addEventListener('change', () => {
                console.log('Category filter changed to:', categoryFilter.value);
                this.filterMerchandise();
            });
        } else {
            console.log('Category filter element not found');
        }

        if (searchInput) {
            console.log('Setting up search input event listener');
            // Remove existing listeners to avoid duplicates
            searchInput.removeEventListener('input', this.filterMerchandise.bind(this));
            searchInput.addEventListener('input', () => {
                console.log('Search input changed to:', searchInput.value);
                this.filterMerchandise();
            });
        } else {
            console.log('Search input element not found');
        }

        // Checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.handleMerchandiseCheckout());

        // Feedback form
        this.setupFeedbackForm();

        // Admin features
        this.setupAdminFeatures();
    }

    // SCENARIO 1: User Registration and Login
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const loginResult = await this.userService.loginUser(email, password);

            if (loginResult.success) {
                this.currentUser = this.userService.getCurrentUser();
                this.hideModal('loginModal');
                await this.loadUserData();
                this.updateUI();
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

    async handleRegister(e) {
        e.preventDefault();
        const userData = {
            userName: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            phoneNumber: document.getElementById('regPhone').value,
            address: document.getElementById('regAddress').value
        };

        try {
            const registrationResult = await this.userService.registerUser(userData);

            if (registrationResult.success) {
                this.showNotification('Registration successful! Please log in.', 'success');
                this.hideModal('registerModal');
                document.getElementById('registerForm').reset();
                this.showModal('loginModal');
            } else {
                this.showNotification(
                    registrationResult.message +
                    (registrationResult.errors ? ': ' + registrationResult.errors.join(', ') : ''),
                    'error'
                );
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    logout() {
        this.userService.logoutUser();
        this.currentUser = null;
        this.cart = [];
        this.ticketBookings = [];
        this.updateUI();
        this.showSection('home');
        this.showNotification('Logged out successfully', 'success');
    }

    // SCENARIO 2: Buy a Ticket and Make Payment
    async handleTicketSearch(e) {
        e.preventDefault();
        const searchData = {
            startLocation: document.getElementById('origin').value,
            endLocation: document.getElementById('destination').value,
            departureDate: document.getElementById('departureDate').value,
            departureTime: document.getElementById('departureTime').value,
            ticketType: document.getElementById('ticketType').value
        };

        try {
            const routes = await this.ticketService.searchRoutes(searchData);
            if (routes.length > 0) {
                this.showRouteResults(routes, searchData);
                this.showNotification('Routes found!', 'success');
            } else {
                this.showNotification('No routes found for your search criteria', 'info');
            }
        } catch (error) {
            console.error('Route search error:', error);
            this.showNotification('Error searching for routes. Please try again.', 'error');
        }
    }

    showRouteResults(routes, searchData) {
        const routeResults = document.getElementById('routeResults');
        const routeList = document.getElementById('routeList');

        routeList.innerHTML = routes.map(route => `
            <div class="route-item" style="background: white; padding: 1rem; margin: 1rem 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${route.startLocation} → ${route.endLocation}</strong><br>
                        Duration: ${route.duration} minutes<br>
                        Departure: ${route.departureTime} | Arrival: ${route.arrivalTime}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: #e74c3c;">RM ${route.price.toFixed(2)}</div>
                        <button class="btn btn-primary" onclick="app.bookTicket('${route.routeID}', '${searchData.departureDate}', '${searchData.departureTime}')" data-testid="book-ticket-${route.routeID}">Book Now</button>
                    </div>
                </div>
            </div>
        `).join('');

        routeResults.classList.remove('hidden');
    }

    async bookTicket(routeID, departureDate, departureTime) {
        if (!this.currentUser) {
            this.showNotification('Please login to book tickets', 'error');
            this.showModal('loginModal');
            return;
        }

        try {
            const bookingData = {
                routeID: routeID,
                departureDate: departureDate,
                departureTime: departureTime,
                passengerCount: 1
            };

            const bookingResult = await this.ticketService.bookTicket(this.currentUser.userID, bookingData);

            if (bookingResult.success) {
                // Process payment
                const paymentData = {
                    orderID: bookingResult.orderID,
                    amount: bookingResult.totalAmount,
                    paymentMethod: 'Credit Card'
                };

                const paymentResult = await this.paymentService.processPayment(paymentData);

                if (paymentResult.success) {
                    this.ticketBookings.push(bookingResult.booking);
                    this.showNotification(`Ticket booked successfully! Total: RM ${bookingResult.totalAmount.toFixed(2)}`, 'success');
                    await this.loadUserData(); // Refresh user data
                } else {
                    this.showNotification('Payment failed: ' + paymentResult.message, 'error');
                }
            } else {
                this.showNotification('Booking failed: ' + bookingResult.message, 'error');
            }
        } catch (error) {
            console.error('Booking error:', error);
            this.showNotification('Error booking ticket. Please try again.', 'error');
        }
    }

    // SCENARIO 3: Cancel Trip and Get Refund
    async cancelTicket(ticketID) {
        if (!this.currentUser) {
            this.showNotification('Please login to cancel tickets', 'error');
            return;
        }

        try {
            const cancellationResult = await this.ticketService.cancelTicket(ticketID, this.currentUser.userID);

            if (cancellationResult.success) {
                // Process refund
                const refundResult = await this.paymentService.processRefund({
                    paymentID: cancellationResult.paymentID,
                    refundAmount: cancellationResult.refundAmount,
                    reason: 'User cancellation'
                });

                if (refundResult.success) {
                    this.showNotification(`Ticket cancelled successfully! Refund: RM ${cancellationResult.refundAmount.toFixed(2)}`, 'success');
                    await this.loadUserData(); // Refresh user data
                } else {
                    this.showNotification('Cancellation successful but refund processing failed', 'warning');
                }
            } else {
                this.showNotification('Cancellation failed: ' + cancellationResult.message, 'error');
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            this.showNotification('Error cancelling ticket. Please try again.', 'error');
        }
    }

    // SCENARIO 4: Admin Generates Usage Statistics
    setupAdminFeatures() {
        // Add admin button if user is admin
        const adminBtn = document.createElement('button');
        adminBtn.id = 'adminBtn';
        adminBtn.className = 'btn btn-secondary';
        adminBtn.textContent = 'Admin Panel';
        adminBtn.style.display = 'none';
        adminBtn.addEventListener('click', () => this.showAdminPanel());

        const nav = document.querySelector('.nav');
        if (nav) {
            nav.appendChild(adminBtn);
        } else {
            console.warn('Admin button not added: .nav element not found');
        }
    }

    async showAdminPanel() {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            this.showNotification('Admin access required', 'error');
            return;
        }

        try {
            // Generate usage statistics
            const stats = await this.generateUsageStatistics();
            this.displayAdminStatistics(stats);
            this.showSection('admin');
        } catch (error) {
            console.error('Admin panel error:', error);
            this.showNotification('Error loading admin panel', 'error');
        }
    }

    async generateUsageStatistics() {
        try {
            // Get statistics from services
            const userStats = await this.userService.getUserStatistics();
            const ticketStats = await this.ticketService.getTicketStatistics();
            const orderStats = await this.orderService.getOrderStatistics();
            const paymentStats = await this.paymentService.getPaymentStatistics();

            return {
                totalUsers: userStats.totalUsers,
                activeUsers: userStats.activeUsers,
                totalTicketsSold: ticketStats.totalSold,
                totalRevenue: paymentStats.totalRevenue,
                popularRoutes: ticketStats.popularRoutes,
                recentOrders: orderStats.recentOrders
            };
        } catch (error) {
            console.error('Error generating statistics:', error);
            throw error;
        }
    }

    displayAdminStatistics(stats) {
        // Create admin section if it doesn't exist
        let adminSection = document.getElementById('admin');
        if (!adminSection) {
            adminSection = document.createElement('div');
            adminSection.id = 'admin';
            adminSection.className = 'section';
            adminSection.innerHTML = `
                <div class="container">
                    <h2>Admin Dashboard</h2>
                    <div id="adminStats"></div>
                </div>
            `;
            document.querySelector('main').appendChild(adminSection);
        }

        const statsContainer = document.getElementById('adminStats');
        statsContainer.innerHTML = `
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">
                <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Total Users</h3>
                    <div style="font-size: 2rem; font-weight: bold; color: #3498db;">${stats.totalUsers}</div>
                </div>
                <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Active Users</h3>
                    <div style="font-size: 2rem; font-weight: bold; color: #2ecc71;">${stats.activeUsers}</div>
                </div>
                <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Tickets Sold</h3>
                    <div style="font-size: 2rem; font-weight: bold; color: #e74c3c;">${stats.totalTicketsSold}</div>
                </div>
                <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Total Revenue</h3>
                    <div style="font-size: 2rem; font-weight: bold; color: #f39c12;">RM ${stats.totalRevenue.toFixed(2)}</div>
                </div>
            </div>
            <div class="popular-routes" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: 2rem;">
                <h3>Popular Routes</h3>
                <ul>
                    ${stats.popularRoutes.map(route => `<li>${route.route}: ${route.bookings} bookings</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // SCENARIO 5: User Submit Feedback
    setupFeedbackForm() {
        // Add feedback form event listener
        const feedbackBtn = document.createElement('button');
        feedbackBtn.id = 'feedbackBtn';
        feedbackBtn.className = 'btn btn-outline';
        feedbackBtn.textContent = 'Give Feedback';
        feedbackBtn.addEventListener('click', () => this.showFeedbackModal());

        // Add to footer or create floating button
        document.body.appendChild(feedbackBtn);
        feedbackBtn.style.position = 'fixed';
        feedbackBtn.style.bottom = '20px';
        feedbackBtn.style.right = '20px';
        feedbackBtn.style.zIndex = '1000';
    }

    showFeedbackModal() {
        const feedbackModal = document.createElement('div');
        feedbackModal.id = 'feedbackModal';
        feedbackModal.className = 'modal';
        feedbackModal.innerHTML = `
            <div class="modal-content">
                <span class="close">×</span>
                <h2>Submit Feedback</h2>
                <form id="feedbackForm">
                    <div class="form-group">
                        <label for="feedbackRating">Rating (1-5):</label>
                        <select id="feedbackRating" required>
                            <option value="">Select Rating</option>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Very Poor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="feedbackCategory">Category:</label>
                        <select id="feedbackCategory" required>
                            <option value="">Select Category</option>
                            <option value="service">Service Quality</option>
                            <option value="booking">Booking Experience</option>
                            <option value="website">Website Usability</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="feedbackSubject">Subject:</label>
                        <input type="text" id="feedbackSubject" placeholder="Enter a brief subject" required minlength="5">
                    </div>
                    <div class="form-group">
                        <label for="feedbackComment">Comments:</label>
                        <textarea id="feedbackComment" rows="4" placeholder="Please share your experience..." required minlength="10"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Submit Feedback</button>
                </form>
            </div>
        `;

        document.body.appendChild(feedbackModal);

        // Setup modal close functionality
        feedbackModal.querySelector('.close').addEventListener('click', () => {
            feedbackModal.remove();
        });

        // Setup form submission
        feedbackModal.querySelector('#feedbackForm').addEventListener('submit', (e) => this.handleFeedbackSubmission(e, feedbackModal));

        feedbackModal.classList.add('active');
    }

    async handleFeedbackSubmission(e, modal) {
        e.preventDefault();

        if (!this.currentUser) {
            this.showNotification('Please login to submit feedback', 'error');
            modal.remove();
            this.showModal('loginModal');
            return;
        }

        const feedbackData = {
            userId: this.currentUser.userID,
            type: document.getElementById('feedbackCategory').value,
            subject: document.getElementById('feedbackSubject').value,
            message: document.getElementById('feedbackComment').value,
            rating: parseInt(document.getElementById('feedbackRating').value)
        };

        try {
            if (!this.feedbackService) {
                console.error("FeedbackService not initialized!");
                this.showNotification('Feedback system error. Please try again later.', 'error');
                return;
            }
            const result = await this.feedbackService.submitFeedback(feedbackData);

            if (result.success) {
                this.showNotification('Thank you for your feedback!', 'success');
                modal.remove();
            } else {
                const errorMessage = result.errors ? result.errors.join(', ') : result.message;
                this.showNotification('Failed to submit feedback: ' + errorMessage, 'error');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            this.showNotification('Error submitting feedback. Please try again.', 'error');
        }
    }

    // SCENARIO 6: Merchandise Purchase
    async loadInitialData() {
        try {
            const merchandiseData = await this.merchandiseService.getAllMerchandise();
            let merchandise = (merchandiseData && merchandiseData.merchandise) ? merchandiseData.merchandise : [];

            if (!merchandise || merchandise.length === 0) {
                console.log("No merchandise found from service or storage. Loading sample merchandise.");
                this.loadSampleMerchandise();
            } else {
                this.displayMerchandise(merchandise);
            }
        } catch (error) {
            console.error('Error loading initial data from service. Falling back to sample merchandise.', error);
            this.loadSampleMerchandise();
        }
    } loadSampleMerchandise() {
        const sampleData = [
            {
                merchandiseID: '1',
                name: 'Kuching ART T-Shirt',
                description: 'Official Kuching ART branded t-shirt made from premium cotton',
                price: 25.00,
                category: 'clothing',
                stockQuantity: 50,
                imageURL: 'images/art-tshirt.jpg',
                isActive: true
            },
            {
                merchandiseID: '2',
                name: 'ART Coffee Mug',
                description: 'Ceramic coffee mug with ART logo, perfect for your morning coffee',
                price: 12.00,
                category: 'accessories',
                stockQuantity: 30,
                imageURL: 'images/art-mug.jpg',
                isActive: true
            },
            {
                merchandiseID: '3',
                name: 'Kuching ART Model Train',
                description: 'Souvenir model train featuring Kuching landmarks',
                price: 8.00,
                category: 'souvenirs',
                stockQuantity: 100,
                imageURL: 'images/art-model-train.jpg',
                isActive: true
            }
        ];
        // Initialize sample data in storage
        this.dataService.saveData('merchandise', sampleData);
        this.displayMerchandise(sampleData);
    }

    displayMerchandise(items) {
        const grid = document.getElementById('merchandiseGrid');
        if (!grid || !Array.isArray(items)) return;

        grid.innerHTML = items.map(item => `
            <div class="merchandise-item" data-testid="merchandise-${item.merchandiseID}">
                <img src="${item.imageURL}" alt="${item.name}">
                <div class="merchandise-item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="merchandise-price">RM ${item.price.toFixed(2)}</div>
                    <button class="btn btn-primary" onclick="app.addToCart('${item.merchandiseID}')" data-testid="add-to-cart-${item.merchandiseID}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    } async filterMerchandise() {
        const category = document.getElementById('categoryFilter')?.value;
        const search = document.getElementById('searchInput')?.value;

        console.log('filterMerchandise called with category:', category, 'search:', search);

        try {
            // Get all merchandise items from DOM
            const allItems = document.querySelectorAll('.merchandise-item');
            console.log('Found DOM items:', allItems.length);

            if (!category && !search) {
                // Show all items
                allItems.forEach(item => {
                    item.style.display = '';
                });
                return;
            }            // Get all merchandise data for filtering
            const allMerchandise = await this.merchandiseService.getAllMerchandise({});
            const merchandiseData = allMerchandise.merchandise || allMerchandise;
            console.log('All merchandise data:', merchandiseData);

            // Filter the data based on category and search
            const filteredData = merchandiseData.filter(item => {
                let matches = true;

                // Category filter
                if (category && item.category !== category) {
                    matches = false;
                }

                // Search filter
                if (search) {
                    const searchTerm = search.toLowerCase();
                    const textMatch =
                        item.name.toLowerCase().includes(searchTerm) ||
                        item.description.toLowerCase().includes(searchTerm) ||
                        item.category.toLowerCase().includes(searchTerm);
                    if (!textMatch) {
                        matches = false;
                    }
                }

                return matches;
            });

            console.log('Filtered data:', filteredData);
            const filteredIds = new Set(filteredData.map(item => item.merchandiseID));
            console.log('Filtered IDs:', filteredIds);

            // Show/hide items based on filter results
            allItems.forEach(item => {
                const testId = item.getAttribute('data-testid');
                if (testId) {
                    const itemId = testId.replace('merchandise-', '');
                    if (filteredIds.has(itemId)) {
                        item.style.display = '';
                        console.log('Showing item:', itemId);
                    } else {
                        item.style.display = 'none';
                        console.log('Hiding item:', itemId);
                    }
                }
            });
        } catch (error) {
            console.error('Error filtering merchandise:', error);
        }
    }

    async addToCart(merchandiseID) {
        try {
            const item = await this.merchandiseService.getMerchandiseById(merchandiseID);
            if (item) {
                const existingItem = this.cart.find(c => c.merchandiseID === merchandiseID);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    this.cart.push({ ...item, quantity: 1 });
                }
                this.updateCart();
                this.showNotification(`${item.name} added to cart!`, 'success');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding item to cart', 'error');
        }
    }

    removeFromCart(merchandiseID) {
        const itemIndex = this.cart.findIndex(cartItem => cartItem.merchandiseID === merchandiseID);

        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            if (item.quantity > 1) {
                item.quantity -= 1;
                this.showNotification(`${item.name} quantity updated in cart.`, 'info');
            } else {
                this.cart.splice(itemIndex, 1);
                this.showNotification(`${item.name} removed from cart.`, 'info');
            }
            this.updateCart();
        } else {
            this.showNotification('Item not found in cart.', 'error');
            console.error(`Attempted to remove item with ID ${merchandiseID} not found in cart.`);
        }
    }

    async handleMerchandiseCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        if (!this.currentUser) {
            this.showNotification('Please login to checkout', 'error');
            this.showModal('loginModal');
            return;
        }

        try {
            // Create order using OrderService
            const orderData = {
                userID: this.currentUser.userID,
                items: this.cart.map(item => ({
                    merchandiseID: item.merchandiseID,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const orderResult = await this.orderService.createOrder(orderData);

            if (orderResult.success) {
                // Process payment
                const paymentData = {
                    orderID: orderResult.orderID,
                    amount: orderResult.totalAmount,
                    paymentMethod: 'Credit Card'
                };

                const paymentResult = await this.paymentService.processPayment(paymentData);

                if (paymentResult.success) {
                    this.cart = [];
                    this.updateCart();
                    this.showNotification(`Order placed successfully!`, 'success');
                    await this.loadUserData(); // Refresh user data
                } else {
                    this.showNotification('Payment failed: ' + paymentResult.message, 'error');
                }
            } else {
                this.showNotification('Order failed: ' + orderResult.message, 'error');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            this.showNotification('Error processing checkout. Please try again.', 'error');
        }
    }

    // UI Helper Methods
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            // Load section-specific data
            if (sectionId === 'merchandise') {
                this.loadInitialData();
            } else if (sectionId === 'profile' && this.currentUser) {
                this.loadProfile();
            }
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    updateCart() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (cartCount && cartItems && cartTotal) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            cartCount.textContent = totalItems;
            cartTotal.textContent = totalPrice.toFixed(2);

            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p>Your cart is empty.</p>';
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #eee;">
                        <div style="flex-grow: 1;">
                            ${item.name} (x${item.quantity})
                            <br>
                            <small>RM ${item.price.toFixed(2)} each</small>
                        </div>
                        <span style="font-weight: bold; margin-right: 10px;">RM ${(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                            class="btn btn-danger btn-sm" 
                            onclick="app.removeFromCart('${item.merchandiseID}')" 
                            data-testid="remove-cart-item-${item.merchandiseID}"
                            style="padding: 2px 5px; font-size: 0.8em;"
                            title="Remove ${item.name}">
                            Remove
                        </button>
                    </div>
                `).join('');
            }
        }
    }

    async loadUserData() {
        if (this.currentUser) {
            try {
                // Load user's orders and tickets
                const orders = await this.orderService.getUserOrders(this.currentUser.userID);
                const tickets = await this.ticketService.getUserTickets(this.currentUser.userID);

                this.userOrders = orders;
                this.ticketBookings = tickets;

                // Update profile display
                this.loadProfile();
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    }

    loadProfile() {
        if (this.currentUser) {
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const loyaltyPoints = document.getElementById('loyaltyPoints');

            if (profileName) profileName.textContent = this.currentUser.userName;
            if (profileEmail) profileEmail.textContent = this.currentUser.email;
            if (loyaltyPoints) loyaltyPoints.textContent = this.currentUser.loyaltyPoints || 0;
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const adminBtn = document.getElementById('adminBtn');

        if (this.currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (registerBtn) registerBtn.classList.add('hidden');
            if (userProfile) userProfile.classList.remove('hidden');
            if (userName) userName.textContent = this.currentUser.userName;

            // Show admin button if user is admin
            if (adminBtn && this.currentUser.isAdmin) {
                adminBtn.style.display = 'block';
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (registerBtn) registerBtn.classList.remove('hidden');
            if (userProfile) userProfile.classList.add('hidden');
            if (adminBtn) adminBtn.style.display = 'none';
        }
    } showNotification(message, type = 'info') {
        // Try to find the notification div (for merchandise page)
        let notification = document.getElementById('notification');

        if (notification) {
            // Use existing notification div
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            notification.setAttribute('data-notification', 'true');

            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        } else {
            // Fallback to creating notifications dynamically
            const notifications = document.getElementById('notifications');
            if (!notifications) return;

            const newNotification = document.createElement('div');
            newNotification.className = `notification ${type}`;
            newNotification.textContent = message;

            const uniqueId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            newNotification.setAttribute('data-testid', uniqueId);
            newNotification.setAttribute('data-notification', 'true');

            notifications.appendChild(newNotification);

            setTimeout(() => {
                if (newNotification.parentNode) {
                    newNotification.remove();
                }
            }, 5000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KuchingARTApp();

    // Set minimum date for ticket booking to today
    const dateInput = document.getElementById('departureDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    if (document.getElementById('merchandise')) {
        window.app.showSection('merchandise');
    }
});

export default KuchingARTApp;
