// dashboard.js - Dashboard functionality for Kuching ART website

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in, if not redirect to login page
    const currentUser = checkAuthStatus();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize dashboard
    initializeDashboard(currentUser);

    // Set up tab navigation
    setupTabNavigation();

    // Set up logout functionality
    setupLogout();

    // Load user's bookings
    loadUserBookings(currentUser);
});

/**
 * Initialize dashboard with user information
 * @param {User} user - The logged in user
 */
function initializeDashboard(user) {
    // Update user information in the sidebar
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;

    // Set profile form values
    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.phoneNumber || '';

    // Initialize dashboard metrics (using mock data for demonstration)
    updateDashboardMetrics(user);
}

/**
 * Update dashboard metrics with user data
 * @param {User} user - The logged in user
 */
function updateDashboardMetrics(user) {
    // Get mock data for demonstration
    const mockData = getMockUserData(user.id);

    // Update dashboard cards
    document.getElementById('active-bookings-count').textContent = mockData.activeBookings;
    document.getElementById('past-trips-count').textContent = mockData.pastTrips;
    document.getElementById('loyalty-points').textContent = mockData.loyaltyPoints;
    document.getElementById('wallet-balance').textContent = `RM ${mockData.walletBalance.toFixed(2)}`;

    // Update recent activities
    renderRecentActivities(mockData.recentActivities);

    // Update upcoming trips
    renderUpcomingTrips(mockData.upcomingTrips);
}

/**
 * Render recent activities on the dashboard
 * @param {Array} activities - List of recent user activities
 */
function renderRecentActivities(activities) {
    const activityListElement = document.getElementById('activity-list');
    
    if (!activities || activities.length === 0) {
        activityListElement.innerHTML = '<p>No recent activities.</p>';
        return;
    }
    
    let activityHTML = '';
    activities.forEach(activity => {
        activityHTML += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <p class="activity-text">${activity.description}</p>
                    <p class="activity-time">${formatActivityTime(activity.timestamp)}</p>
                </div>
            </div>
        `;
    });
    
    activityListElement.innerHTML = activityHTML;
}

/**
 * Render upcoming trips on the dashboard
 * @param {Array} trips - List of upcoming trips
 */
function renderUpcomingTrips(trips) {
    const tripListElement = document.getElementById('upcoming-trip-list');
    
    if (!trips || trips.length === 0) {
        tripListElement.innerHTML = '<p>No upcoming trips scheduled.</p>';
        return;
    }
    
    let tripsHTML = '';
    trips.forEach(trip => {
        const departureDate = new Date(trip.departureTime);
        
        tripsHTML += `
            <div class="trip-item">
                <div class="trip-date">
                    <div class="date-day">${departureDate.getDate()}</div>
                    <div class="date-month">${departureDate.toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div class="trip-details">
                    <h4>${trip.route}</h4>
                    <p>${trip.departureStation} to ${trip.arrivalStation}</p>
                    <p>Departure: ${formatTime(departureDate)}</p>
                </div>
                <div class="trip-actions">
                    <a href="manage-booking.html?ref=${trip.bookingId}&email=${encodeURIComponent(document.getElementById('user-email').textContent)}" class="btn small-btn">Manage</a>
                </div>
            </div>
        `;
    });
    
    tripListElement.innerHTML = tripsHTML;
}

/**
 * Load user's bookings and populate the bookings table
 * @param {User} user - The logged in user
 */
function loadUserBookings(user) {
    // Get mock booking data for demonstration
    const mockData = getMockUserData(user.id);
    const bookings = mockData.bookings;
    
    const tableBody = document.getElementById('bookings-table-body');
    
    if (!bookings || bookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">No bookings found</td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    bookings.forEach(booking => {
        const departureDate = new Date(booking.departureTime);
        
        tableHTML += `
            <tr>
                <td>${booking.bookingId}</td>
                <td>${formatDate(departureDate)}</td>
                <td>${booking.route}</td>
                <td>${booking.departureStation} - ${booking.arrivalStation}</td>
                <td><span class="status-badge status-${booking.status.toLowerCase()}">${capitalizeFirstLetter(booking.status)}</span></td>
                <td class="action-links">
                    <a href="manage-booking.html?ref=${booking.bookingId}&email=${encodeURIComponent(user.email)}" title="Manage Booking"><i class="fas fa-cog"></i></a>
                    ${booking.status === 'confirmed' ? `<a href="#" class="print-ticket" data-id="${booking.bookingId}" title="Print Ticket"><i class="fas fa-print"></i></a>` : ''}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    
    // Add event listeners for print ticket buttons
    const printButtons = document.querySelectorAll('.print-ticket');
    printButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            printTicket(this.getAttribute('data-id'));
        });
    });
    
    // Set up booking filters
    setupBookingFilters(bookings);
}

/**
 * Set up filters for the bookings table
 * @param {Array} bookings - List of user bookings
 */
function setupBookingFilters(bookings) {
    const statusFilter = document.getElementById('booking-status-filter');
    const dateFilter = document.getElementById('booking-date-filter');
    const resetButton = document.getElementById('reset-filters');
    
    if (statusFilter && dateFilter && resetButton) {
        // Status filter change event
        statusFilter.addEventListener('change', function() {
            filterBookings();
        });
        
        // Date filter change event
        dateFilter.addEventListener('change', function() {
            filterBookings();
        });
        
        // Reset filters button click
        resetButton.addEventListener('click', function() {
            statusFilter.value = 'all';
            dateFilter.value = '';
            filterBookings();
        });
    }
    
    // Function to filter bookings based on filter values
    function filterBookings() {
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;
        
        const filteredBookings = bookings.filter(booking => {
            let statusMatch = true;
            let dateMatch = true;
            
            // Check status filter
            if (statusValue !== 'all') {
                statusMatch = booking.status.toLowerCase() === statusValue.toLowerCase();
            }
            
            // Check date filter
            if (dateValue) {
                const bookingDate = new Date(booking.departureTime);
                const filterDate = new Date(dateValue);
                
                dateMatch = bookingDate.toDateString() === filterDate.toDateString();
            }
            
            return statusMatch && dateMatch;
        });
        
        // Re-render the table with filtered bookings
        renderBookingsTable(filteredBookings);
    }
    
    // Function to render bookings table with filtered data
    function renderBookingsTable(filteredBookings) {
        const user = checkAuthStatus();
        const tableBody = document.getElementById('bookings-table-body');
        
        if (!filteredBookings || filteredBookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">No bookings match the filter criteria</td>
                </tr>
            `;
            return;
        }
        
        let tableHTML = '';
        filteredBookings.forEach(booking => {
            const departureDate = new Date(booking.departureTime);
            
            tableHTML += `
                <tr>
                    <td>${booking.bookingId}</td>
                    <td>${formatDate(departureDate)}</td>
                    <td>${booking.route}</td>
                    <td>${booking.departureStation} - ${booking.arrivalStation}</td>
                    <td><span class="status-badge status-${booking.status.toLowerCase()}">${capitalizeFirstLetter(booking.status)}</span></td>
                    <td class="action-links">
                        <a href="manage-booking.html?ref=${booking.bookingId}&email=${encodeURIComponent(user.email)}" title="Manage Booking"><i class="fas fa-cog"></i></a>
                        ${booking.status === 'confirmed' ? `<a href="#" class="print-ticket" data-id="${booking.bookingId}" title="Print Ticket"><i class="fas fa-print"></i></a>` : ''}
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
        
        // Re-add event listeners for print ticket buttons
        const printButtons = document.querySelectorAll('.print-ticket');
        printButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                printTicket(this.getAttribute('data-id'));
            });
        });
    }
}

/**
 * Set up tab navigation in the dashboard
 */
function setupTabNavigation() {
    const tabLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
    const tabs = document.querySelectorAll('.dashboard-tab');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the tab to show
            const tabToShow = this.getAttribute('data-tab');
            
            // Remove active class from all links and tabs
            tabLinks.forEach(link => link.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked link and corresponding tab
            this.classList.add('active');
            document.getElementById(`${tabToShow}-tab`).classList.add('active');
        });
    });
    
    // Set up profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('profile-name').value;
            const phone = document.getElementById('profile-phone').value;
            const address = document.getElementById('profile-address').value;
            
            // Update user profile (in a real app, this would call an API)
            updateUserProfile(name, phone, address);
        });
    }
    
    // Set up password change form submission
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate password change
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all password fields');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            // Change password (in a real app, this would call an API)
            changePassword(currentPassword, newPassword);
        });
    }
    
    // Set up preferences form submission
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const emailNotifications = document.getElementById('email-notifications').checked;
            const smsNotifications = document.getElementById('sms-notifications').checked;
            const bookingReminders = document.getElementById('booking-reminders').checked;
            const specialOffers = document.getElementById('special-offers').checked;
            const preferredStation = document.getElementById('preferred-station').value;
            const preferredPayment = document.getElementById('preferred-payment').value;
            
            // Save preferences (in a real app, this would call an API)
            savePreferences({
                emailNotifications,
                smsNotifications,
                bookingReminders,
                specialOffers,
                preferredStation,
                preferredPayment
            });
        });
    }
}

/**
 * Set up logout functionality
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout(); // This calls the logout function from auth.js
        });
    }
}

/**
 * Update user profile information
 * @param {string} name - User's updated name
 * @param {string} phone - User's updated phone number
 * @param {string} address - User's updated address
 */
function updateUserProfile(name, phone, address) {
    // In a real app, this would call an API to update the user's profile
    const currentUser = checkAuthStatus();
    
    if (currentUser) {
        // Update the user object with new information
        currentUser.name = name;
        currentUser.phoneNumber = phone;
        
        // Save the updated user to session storage
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber,
            isLoggedIn: currentUser.isLoggedIn
        }));
        
        // Update UI elements with new info
        document.getElementById('user-name').textContent = name;
        
        alert('Profile updated successfully!');
    }
}

/**
 * Change user password
 * @param {string} currentPassword - User's current password
 * @param {string} newPassword - User's new password
 */
function changePassword(currentPassword, newPassword) {
    // In a real app, this would call an API to verify the current password and update to the new one
    // For demonstration, we'll just show a success message
    alert('Password changed successfully!');
    
    // Clear the password form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

/**
 * Save user preferences
 * @param {Object} preferences - User preferences object
 */
function savePreferences(preferences) {
    // In a real app, this would call an API to save the user's preferences
    // For demonstration, we'll just show a success message and store in local storage
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    alert('Preferences saved successfully!');
}

/**
 * Print ticket for a booking
 * @param {string} bookingId - ID of the booking to print ticket for
 */
function printTicket(bookingId) {
    // In a real app, this would generate a printable ticket or open a print dialog
    alert(`Ticket for booking ${bookingId} would be printed or downloaded.`);
}

/**
 * Get mock user data for demonstration
 * @param {string} userId - User ID
 * @returns {Object} Mock user data
 */
function getMockUserData(userId) {
    // Generate random data based on user ID to simulate personalized data
    const seed = parseInt(userId.replace(/[^0-9]/g, '')) || 123;
    const random = (min, max) => Math.floor((seed * Math.random()) % (max - min + 1)) + min;
    
    const activeBookings = random(0, 3);
    const pastTrips = random(2, 10);
    
    // Generate mock bookings
    const bookings = [];
    for (let i = 0; i < activeBookings + pastTrips; i++) {
        const today = new Date();
        let departureTime;
        let status;
        
        if (i < activeBookings) {
            // Future trips (active bookings)
            departureTime = new Date(today);
            departureTime.setDate(today.getDate() + random(1, 14)); // 1-14 days in future
            status = 'confirmed';
        } else {
            // Past trips
            departureTime = new Date(today);
            departureTime.setDate(today.getDate() - random(1, 60)); // 1-60 days in past
            status = Math.random() > 0.1 ? 'completed' : 'cancelled'; // 10% chance of cancelled
        }
        
        // Random route
        const routes = ['Blue Line', 'Red Line'];
        const stations = {
            'Blue Line': ['Kuching Sentral', 'Satok', 'Petra Jaya'],
            'Red Line': ['Kuching Sentral', 'Damai', 'Samarahan']
        };
        
        const route = routes[random(0, 1)];
        const allStations = stations[route];
        const departureStation = allStations[random(0, allStations.length - 2)];
        // Make sure arrival station is different from departure
        let arrivalStationIndex = random(0, allStations.length - 1);
        while (allStations[arrivalStationIndex] === departureStation) {
            arrivalStationIndex = random(0, allStations.length - 1);
        }
        const arrivalStation = allStations[arrivalStationIndex];
        
        bookings.push({
            bookingId: 'KCH' + (10000000 + seed * (i + 1)),
            route: route,
            departureStation: departureStation,
            arrivalStation: arrivalStation,
            departureTime: departureTime,
            status: status
        });
    }
    
    // Sort bookings by date (future trips first)
    bookings.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
    
    // Get upcoming trips (active bookings)
    const upcomingTrips = bookings.filter(booking => booking.status === 'confirmed');
    
    // Generate recent activities
    const activityTypes = ['booking', 'cancellation', 'payment', 'login'];
    const recentActivities = [];
    
    for (let i = 0; i < random(2, 5); i++) {
        const activityTime = new Date();
        activityTime.setHours(activityTime.getHours() - random(1, 72)); // 1-72 hours ago
        
        const activityType = activityTypes[random(0, activityTypes.length - 1)];
        let description;
        
        switch (activityType) {
            case 'booking':
                description = `Booked a trip from ${bookings[0].departureStation} to ${bookings[0].arrivalStation}`;
                break;
            case 'cancellation':
                description = 'Cancelled a booking';
                break;
            case 'payment':
                description = `Made a payment of RM ${random(3, 15)}.00`;
                break;
            case 'login':
                description = 'Logged into account';
                break;
        }
        
        recentActivities.push({
            type: activityType,
            description: description,
            timestamp: activityTime
        });
    }
    
    // Sort activities by time (most recent first)
    recentActivities.sort((a, b) => b.timestamp - a.timestamp);
    
    return {
        activeBookings: activeBookings,
        pastTrips: pastTrips,
        loyaltyPoints: random(50, 500),
        walletBalance: random(10, 100) + Math.random(),
        bookings: bookings,
        upcomingTrips: upcomingTrips,
        recentActivities: recentActivities
    };
}

/**
 * Get icon class for activity type
 * @param {string} activityType - Type of activity
 * @returns {string} Font Awesome icon class
 */
function getActivityIcon(activityType) {
    switch (activityType) {
        case 'booking':
            return 'fa-ticket-alt';
        case 'cancellation':
            return 'fa-times-circle';
        case 'payment':
            return 'fa-credit-card';
        case 'login':
            return 'fa-sign-in-alt';
        default:
            return 'fa-circle';
    }
}

/**
 * Format activity timestamp to relative time
 * @param {Date} timestamp - Activity timestamp
 * @returns {string} Formatted relative time
 */
function formatActivityTime(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
        return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

/**
 * Format date (DD MMM YYYY)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
}

/**
 * Format time (HH:MM AM/PM)
 * @param {Date} date - Date to format
 * @returns {string} Formatted time
 */
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Hour '0' should be '12'
    
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
}

/**
 * Capitalize first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
