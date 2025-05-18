// app.js - Main JavaScript file for Kuching ART website

// User class to manage user authentication and profile
class User {
    constructor(id, name, email, phoneNumber, isLoggedIn = false) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.isLoggedIn = isLoggedIn;
        this.bookings = [];
    }

    login() {
        this.isLoggedIn = true;
        // Store user data in session storage
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: this.id,
            name: this.name,
            email: this.email,
            phoneNumber: this.phoneNumber,
            isLoggedIn: this.isLoggedIn
        }));
    }

    logout() {
        this.isLoggedIn = false;
        // Clear user data from session storage
        sessionStorage.removeItem('currentUser');
    }

    getBookings() {
        return this.bookings;
    }

    addBooking(booking) {
        this.bookings.push(booking);
    }
}

// Station class to represent transit stations
class Station {
    constructor(id, name, location, routes) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.routes = routes;
    }
}

// Route class to represent transit routes
class Route {
    constructor(id, name, stations, color) {
        this.id = id;
        this.name = name;
        this.stations = stations;
        this.color = color;
    }
}

// Trip class to represent a transit trip
class Trip {
    constructor(id, route, departureStation, arrivalStation, departureTime, arrivalTime, price) {
        this.id = id;
        this.route = route;
        this.departureStation = departureStation;
        this.arrivalStation = arrivalStation;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.price = price;
        this.availableSeats = 50; // Assuming 50 seats available by default
    }

    calculateDuration() {
        const departureTime = new Date(this.departureTime);
        const arrivalTime = new Date(this.arrivalTime);
        return (arrivalTime - departureTime) / (1000 * 60); // Duration in minutes
    }

    isAvailable() {
        return this.availableSeats > 0;
    }

    bookSeat(numSeats = 1) {
        if (this.availableSeats >= numSeats) {
            this.availableSeats -= numSeats;
            return true;
        }
        return false;
    }
}

// Booking class to represent a ticket booking
class Booking {
    constructor(id, user, trip, passengers, bookingDate, status = 'confirmed') {
        this.id = id;
        this.user = user;
        this.trip = trip;
        this.passengers = passengers; // Array of passenger objects
        this.bookingDate = bookingDate;
        this.status = status; // confirmed, cancelled, rescheduled
        this.paymentInfo = null;
    }

    getTotalPrice() {
        return this.trip.price * this.passengers.length;
    }

    addPaymentInfo(paymentInfo) {
        this.paymentInfo = paymentInfo;
    }

    cancel() {
        this.status = 'cancelled';
        // Logic for refunding based on booking time vs cancellation time
    }

    reschedule(newTrip) {
        const oldTrip = this.trip;
        this.trip = newTrip;
        this.status = 'rescheduled';
        return oldTrip;
    }

    generateTicket() {
        // Generate ticket information for download/print
        return {
            bookingId: this.id,
            route: this.trip.route.name,
            departureStation: this.trip.departureStation.name,
            arrivalStation: this.trip.arrivalStation.name,
            departureTime: this.trip.departureTime,
            arrivalTime: this.trip.arrivalTime,
            passengers: this.passengers,
            price: this.getTotalPrice(),
            status: this.status
        };
    }
}

// Passenger class to represent passenger information
class Passenger {
    constructor(name, type, idNumber = null) {
        this.name = name;
        this.type = type; // adult, child, senior, student
        this.idNumber = idNumber; // for identification if needed
    }
}

// Payment class to handle payment information
class Payment {
    constructor(id, amount, method, status = 'pending') {
        this.id = id;
        this.amount = amount;
        this.method = method; // card, ewallet
        this.status = status; // pending, completed, refunded
        this.timestamp = new Date();
    }

    complete() {
        this.status = 'completed';
        this.timestamp = new Date();
        return true;
    }

    refund(amount = null) {
        const refundAmount = amount || this.amount;
        this.status = 'refunded';
        this.timestamp = new Date();
        return refundAmount;
    }
}

// BookingManager class to manage the booking process
class BookingManager {
    constructor() {
        this.bookings = [];
    }

    createBooking(user, trip, passengers) {
        const bookingId = 'KCH' + Math.floor(10000000 + Math.random() * 90000000);
        const newBooking = new Booking(
            bookingId,
            user,
            trip,
            passengers,
            new Date()
        );
        
        // Check if seats are available and book them
        if (trip.bookSeat(passengers.length)) {
            this.bookings.push(newBooking);
            user.addBooking(newBooking);
            return newBooking;
        }
        
        return null; // Booking failed
    }

    getBookingById(bookingId) {
        return this.bookings.find(booking => booking.id === bookingId);
    }

    getUserBookings(userId) {
        return this.bookings.filter(booking => booking.user.id === userId);
    }

    cancelBooking(bookingId) {
        const booking = this.getBookingById(bookingId);
        if (booking) {
            booking.cancel();
            return true;
        }
        return false;
    }

    rescheduleBooking(bookingId, newTrip) {
        const booking = this.getBookingById(bookingId);
        if (booking && newTrip.bookSeat(booking.passengers.length)) {
            const oldTrip = booking.reschedule(newTrip);
            // Release seats on old trip
            oldTrip.availableSeats += booking.passengers.length;
            return true;
        }
        return false;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUserData = sessionStorage.getItem('currentUser');
    let currentUser = null;
    
    if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        currentUser = new User(
            userData.id,
            userData.name,
            userData.email,
            userData.phoneNumber,
            userData.isLoggedIn
        );
        
        // Update UI for logged-in user
        updateUIForLoggedInUser(currentUser);
    }
    
    // Event listeners and other initializations
    initializeApp();
});

function updateUIForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = user.name;
        loginBtn.href = 'dashboard.html';
    }
}

function initializeApp() {
    // Initialize any event listeners or features needed on all pages
    
    // Example: Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Export classes for use in other scripts
window.User = User;
window.Station = Station;
window.Route = Route;
window.Trip = Trip;
window.Booking = Booking;
window.Passenger = Passenger;
window.Payment = Payment;
window.BookingManager = BookingManager;
