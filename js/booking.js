// booking.js - Booking functionality for Kuching ART website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the booking manager
    const bookingManager = new BookingManager();
    
    // Get DOM elements for each step
    const step1Content = document.getElementById('step1-content');
    const step2Content = document.getElementById('step2-content');
    const step3Content = document.getElementById('step3-content');
    const step4Content = document.getElementById('step4-content');
    const step5Content = document.getElementById('step5-content');
    
    // Get navigation buttons
    const step1NextBtn = document.getElementById('step1-next');
    const step2PrevBtn = document.getElementById('step2-prev');
    const step2NextBtn = document.getElementById('step2-next');
    const step3PrevBtn = document.getElementById('step3-prev');
    const step3NextBtn = document.getElementById('step3-next');
    const step4PrevBtn = document.getElementById('step4-prev');
    const step4NextBtn = document.getElementById('step4-next');
    const downloadTicketBtn = document.getElementById('download-ticket');
    
    // Step indicators
    const stepIndicators = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3'),
        step4: document.getElementById('step4'),
        step5: document.getElementById('step5')
    };
    
    // Form elements
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');
    const travelDateInput = document.getElementById('travel-date');
    const passengersSelect = document.getElementById('passengers');
    
    // Initialize stations (in a real app, this would come from a server)
    const stations = [
        new Station('kuching-sentral', 'Kuching Sentral', { lat: 1.5283, lng: 110.3785 }, ['blue-line', 'red-line']),
        new Station('satok', 'Satok', { lat: 1.5583, lng: 110.3385 }, ['blue-line']),
        new Station('damai', 'Damai', { lat: 1.5683, lng: 110.3285 }, ['red-line']),
        new Station('petra-jaya', 'Petra Jaya', { lat: 1.5783, lng: 110.3485 }, ['blue-line']),
        new Station('samarahan', 'Samarahan', { lat: 1.4583, lng: 110.4285 }, ['red-line'])
    ];
    
    // Initialize routes
    const routes = [
        new Route('blue-line', 'Blue Line', ['kuching-sentral', 'satok', 'petra-jaya'], '#0066cc'),
        new Route('red-line', 'Red Line', ['kuching-sentral', 'damai', 'samarahan'], '#cc0000')
    ];
    
    // Set minimum date for travel date input to today
    if (travelDateInput) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        
        travelDateInput.min = yyyy + '-' + mm + '-' + dd;
    }
    
    // Step 1: Trip Details to Step 2: Select Trip
    if (step1NextBtn) {
        step1NextBtn.addEventListener('click', function() {
            if (validateStep1()) {
                // Get form values
                const origin = originSelect.value;
                const destination = destinationSelect.value;
                const travelDate = travelDateInput.value;
                const passengers = parseInt(passengersSelect.value);
                
                // Store booking data in session
                sessionStorage.setItem('bookingData', JSON.stringify({
                    origin,
                    destination,
                    travelDate,
                    passengers
                }));
                
                // Load available trips
                loadAvailableTrips(origin, destination, travelDate);
                
                // Show step 2
                goToStep(2);
            }
        });
    }
    
    // Step 2: Select Trip - Previous button
    if (step2PrevBtn) {
        step2PrevBtn.addEventListener('click', function() {
            goToStep(1);
        });
    }
    
    // Step 2: Select Trip - Next button
    if (step2NextBtn) {
        step2NextBtn.addEventListener('click', function() {
            // Check if a trip is selected
            const selectedTrip = document.querySelector('input[name="trip"]:checked');
            if (selectedTrip) {
                // Get the selected trip data
                const tripId = selectedTrip.value;
                
                // Get trip details
                const trip = getTrip(tripId);
                
                // Store selected trip in session
                const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
                bookingData.tripId = tripId;
                sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
                
                // Generate passenger forms
                generatePassengerForms(bookingData.passengers);
                
                // Go to step 3
                goToStep(3);
            }
        });
    }
    
    // Step 3: Passenger Info - Previous button
    if (step3PrevBtn) {
        step3PrevBtn.addEventListener('click', function() {
            goToStep(2);
        });
    }
    
    // Step 3: Passenger Info - Next button
    if (step3NextBtn) {
        step3NextBtn.addEventListener('click', function() {
            if (validatePassengerForms()) {
                // Collect passenger data
                const passengers = [];
                const passengerForms = document.querySelectorAll('.passenger-form');
                
                passengerForms.forEach((form, index) => {
                    const name = form.querySelector(`#passenger-name-${index}`).value;
                    const type = form.querySelector(`#passenger-type-${index}`).value;
                    const idNumber = form.querySelector(`#passenger-id-${index}`).value;
                    
                    passengers.push(new Passenger(name, type, idNumber));
                });
                
                // Store passenger data in session
                const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
                bookingData.passengerDetails = passengers;
                sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
                
                // Load trip summary
                loadTripSummary(bookingData);
                
                // Go to step 4
                goToStep(4);
            }
        });
    }
    
    // Step 4: Payment - Previous button
    if (step4PrevBtn) {
        step4PrevBtn.addEventListener('click', function() {
            goToStep(3);
        });
    }
    
    // Step 4: Payment - Next button (Proceed to Payment)
    if (step4NextBtn) {
        step4NextBtn.addEventListener('click', function() {
            if (validatePaymentForm()) {
                // Process payment (in a real app, this would call a payment gateway)
                processPayment()
                    .then(() => {
                        // Create booking
                        const booking = createBooking();
                        
                        // Display confirmation details
                        displayConfirmation(booking);
                        
                        // Go to step 5
                        goToStep(5);
                    })
                    .catch(error => {
                        alert('Payment failed: ' + error.message);
                    });
            }
        });
    }
    
    // Set up payment method toggle
    const cardPayment = document.getElementById('card-payment');
    const eWalletPayment = document.getElementById('e-wallet-payment');
    const cardPaymentDetails = document.getElementById('card-payment-details');
    const eWalletPaymentDetails = document.getElementById('e-wallet-payment-details');
    
    if (cardPayment && eWalletPayment) {
        cardPayment.addEventListener('change', function() {
            if (this.checked) {
                cardPaymentDetails.style.display = 'block';
                eWalletPaymentDetails.style.display = 'none';
            }
        });
        
        eWalletPayment.addEventListener('change', function() {
            if (this.checked) {
                cardPaymentDetails.style.display = 'none';
                eWalletPaymentDetails.style.display = 'block';
            }
        });
    }
    
    // Download ticket button
    if (downloadTicketBtn) {
        downloadTicketBtn.addEventListener('click', function() {
            // In a real app, this would generate a PDF or similar
            alert('Ticket download functionality would be implemented here.');
        });
    }
    
    // Validate Step 1 form
    function validateStep1() {
        const origin = originSelect.value;
        const destination = destinationSelect.value;
        const travelDate = travelDateInput.value;
        
        if (!origin) {
            alert('Please select an origin station.');
            return false;
        }
        
        if (!destination) {
            alert('Please select a destination station.');
            return false;
        }
        
        if (origin === destination) {
            alert('Origin and destination stations cannot be the same.');
            return false;
        }
        
        if (!travelDate) {
            alert('Please select a travel date.');
            return false;
        }
        
        return true;
    }
    
    // Validate passenger forms
    function validatePassengerForms() {
        const passengerForms = document.querySelectorAll('.passenger-form');
        let isValid = true;
        
        passengerForms.forEach((form, index) => {
            const name = form.querySelector(`#passenger-name-${index}`).value;
            const type = form.querySelector(`#passenger-type-${index}`).value;
            
            if (!name) {
                alert(`Please enter a name for Passenger ${index + 1}.`);
                isValid = false;
                return;
            }
            
            if (!type) {
                alert(`Please select a passenger type for Passenger ${index + 1}.`);
                isValid = false;
                return;
            }
        });
        
        return isValid;
    }
    
    // Validate payment form
    function validatePaymentForm() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        if (paymentMethod === 'card') {
            const cardName = document.getElementById('card-name').value;
            const cardNumber = document.getElementById('card-number').value;
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCvv = document.getElementById('card-cvv').value;
            
            if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
                alert('Please fill in all card details.');
                return false;
            }
            
            // Simple card number validation
            if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
                alert('Please enter a valid 16-digit card number.');
                return false;
            }
            
            // Simple expiry date validation (MM/YY format)
            if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                alert('Please enter a valid expiry date in MM/YY format.');
                return false;
            }
            
            // Simple CVV validation
            if (!/^\d{3}$/.test(cardCvv)) {
                alert('Please enter a valid 3-digit CVV.');
                return false;
            }
        } else if (paymentMethod === 'ewallet') {
            const walletType = document.getElementById('wallet-type').value;
            const walletNumber = document.getElementById('wallet-number').value;
            
            if (!walletType) {
                alert('Please select an e-wallet provider.');
                return false;
            }
            
            if (!walletNumber) {
                alert('Please enter your e-wallet phone number.');
                return false;
            }
        }
        
        return true;
    }
    
    // Load available trips
    function loadAvailableTrips(origin, destination, date) {
        const availableTripsContainer = document.getElementById('available-trips');
        availableTripsContainer.innerHTML = '';
        
        // In a real app, this would fetch data from a server
        // For demonstration, we'll create some mock trips
        const trips = generateMockTrips(origin, destination, date);
        
        if (trips.length === 0) {
            availableTripsContainer.innerHTML = '<p>No trips available for the selected route and date. Please try another date or route.</p>';
            return;
        }
        
        trips.forEach(trip => {
            const departureTime = new Date(trip.departureTime);
            const arrivalTime = new Date(trip.arrivalTime);
            
            const tripElement = document.createElement('div');
            tripElement.className = 'schedule-item';
            tripElement.innerHTML = `
                <input type="radio" name="trip" id="trip-${trip.id}" value="${trip.id}">
                <label for="trip-${trip.id}" class="schedule-label">
                    <div class="trip-details">
                        <div class="schedule-time">
                            <span class="departure-time">${formatTime(departureTime)}</span>
                            <span class="trip-duration">${trip.calculateDuration()} min</span>
                            <span class="arrival-time">${formatTime(arrivalTime)}</span>
                        </div>
                        <div class="schedule-stations">
                            <div class="station-from">${trip.departureStation.name}</div>
                            <div class="station-to">${trip.arrivalStation.name}</div>
                        </div>
                        <div class="schedule-price">RM ${trip.price.toFixed(2)}</div>
                    </div>
                </label>
            `;
            
            availableTripsContainer.appendChild(tripElement);
        });
        
        // Add event listener to enable/disable next button based on selection
        const tripRadios = document.querySelectorAll('input[name="trip"]');
        tripRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                step2NextBtn.disabled = false;
            });
        });
    }
    
    // Generate passenger forms
    function generatePassengerForms(numberOfPassengers) {
        const passengerFormsContainer = document.getElementById('passenger-forms');
        passengerFormsContainer.innerHTML = '';
        
        for (let i = 0; i < numberOfPassengers; i++) {
            const passengerForm = document.createElement('div');
            passengerForm.className = 'passenger-form';
            passengerForm.innerHTML = `
                <h4>Passenger ${i + 1}</h4>
                <div class="form-group">
                    <label for="passenger-name-${i}">Full Name</label>
                    <input type="text" id="passenger-name-${i}" name="passengerName${i}" required>
                </div>
                <div class="form-group">
                    <label for="passenger-type-${i}">Passenger Type</label>
                    <select id="passenger-type-${i}" name="passengerType${i}" required>
                        <option value="">Select Passenger Type</option>
                        <option value="adult">Adult</option>
                        <option value="child">Child (5-12 years)</option>
                        <option value="senior">Senior Citizen (60+ years)</option>
                        <option value="student">Student</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="passenger-id-${i}">ID Number (Optional)</label>
                    <input type="text" id="passenger-id-${i}" name="passengerId${i}" placeholder="IC / Passport / Student ID">
                </div>
            `;
            
            passengerFormsContainer.appendChild(passengerForm);
        }
    }
    
    // Load trip summary
    function loadTripSummary(bookingData) {
        const tripSummaryContainer = document.getElementById('trip-summary');
        const totalPriceElement = document.getElementById('total-price');
        
        const trip = getTrip(bookingData.tripId);
        const originStation = getStation(bookingData.origin);
        const destinationStation = getStation(bookingData.destination);
        
        const departureTime = new Date(trip.departureTime);
        const arrivalTime = new Date(trip.arrivalTime);
        
        // Calculate total price
        const totalPrice = trip.price * bookingData.passengers;
        
        // Update summary
        tripSummaryContainer.innerHTML = `
            <div class="summary-item">
                <span>Origin:</span>
                <span>${originStation.name}</span>
            </div>
            <div class="summary-item">
                <span>Destination:</span>
                <span>${destinationStation.name}</span>
            </div>
            <div class="summary-item">
                <span>Date:</span>
                <span>${formatDate(new Date(bookingData.travelDate))}</span>
            </div>
            <div class="summary-item">
                <span>Departure Time:</span>
                <span>${formatTime(departureTime)}</span>
            </div>
            <div class="summary-item">
                <span>Arrival Time:</span>
                <span>${formatTime(arrivalTime)}</span>
            </div>
            <div class="summary-item">
                <span>Passengers:</span>
                <span>${bookingData.passengers}x @ RM ${trip.price.toFixed(2)}</span>
            </div>
        `;
        
        totalPriceElement.textContent = `RM ${totalPrice.toFixed(2)}`;
    }
    
    // Process payment (mock function)
    function processPayment() {
        return new Promise((resolve, reject) => {
            // Simulate API call delay
            setTimeout(() => {
                // Success 90% of the time for demo purposes
                const isSuccess = Math.random() < 0.9;
                
                if (isSuccess) {
                    resolve();
                } else {
                    reject(new Error('Payment declined. Please try again.'));
                }
            }, 1500);
        });
    }
    
    // Create booking
    function createBooking() {
        // Get booking data from session storage
        const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
        
        // Get current user (or create a guest user if not logged in)
        let currentUser = checkAuthStatus();
        if (!currentUser) {
            currentUser = new User(
                'guest_' + Math.floor(Math.random() * 10000),
                'Guest User',
                'guest@example.com',
                '',
                false
            );
        }
        
        // Get trip
        const trip = getTrip(bookingData.tripId);
        
        // Create booking
        const booking = bookingManager.createBooking(
            currentUser,
            trip,
            bookingData.passengerDetails
        );
        
        // Add payment info
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const paymentId = 'PMT' + Math.floor(10000000 + Math.random() * 90000000);
        const payment = new Payment(
            paymentId,
            trip.price * bookingData.passengers,
            paymentMethod,
            'completed'
        );
        
        booking.addPaymentInfo(payment);
        
        // Store booking reference in session for later use
        sessionStorage.setItem('lastBookingId', booking.id);
        
        return booking;
    }
    
    // Display confirmation
    function displayConfirmation(booking) {
        const confirmationDetails = document.getElementById('confirmation-details');
        const bookingReference = document.getElementById('booking-reference');
        
        bookingReference.textContent = booking.id;
        
        const departureTime = new Date(booking.trip.departureTime);
        const arrivalTime = new Date(booking.trip.arrivalTime);
        
        confirmationDetails.innerHTML = `
            <div class="summary-item">
                <span>Date:</span>
                <span>${formatDate(departureTime)}</span>
            </div>
            <div class="summary-item">
                <span>Route:</span>
                <span>${booking.trip.route.name}</span>
            </div>
            <div class="summary-item">
                <span>From:</span>
                <span>${booking.trip.departureStation.name}</span>
            </div>
            <div class="summary-item">
                <span>To:</span>
                <span>${booking.trip.arrivalStation.name}</span>
            </div>
            <div class="summary-item">
                <span>Departure Time:</span>
                <span>${formatTime(departureTime)}</span>
            </div>
            <div class="summary-item">
                <span>Arrival Time:</span>
                <span>${formatTime(arrivalTime)}</span>
            </div>
            <div class="summary-item">
                <span>Passengers:</span>
                <span>${booking.passengers.length}</span>
            </div>
            <div class="summary-item">
                <span>Total Amount:</span>
                <span>RM ${booking.getTotalPrice().toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Payment Method:</span>
                <span>${booking.paymentInfo.method === 'card' ? 'Credit/Debit Card' : 'E-Wallet'}</span>
            </div>
        `;
    }
    
    // Helper function to go to a specific step
    function goToStep(stepNumber) {
        // Hide all step contents
        step1Content.style.display = 'none';
        step2Content.style.display = 'none';
        step3Content.style.display = 'none';
        step4Content.style.display = 'none';
        step5Content.style.display = 'none';
        
        // Remove active class from all step indicators
        Object.values(stepIndicators).forEach(indicator => {
            indicator.classList.remove('active');
            indicator.classList.remove('completed');
        });
        
        // Show the selected step content
        const stepContent = document.getElementById(`step${stepNumber}-content`);
        if (stepContent) {
            stepContent.style.display = 'block';
        }
        
        // Update step indicators
        for (let i = 1; i <= 5; i++) {
            const stepIndicator = stepIndicators[`step${i}`];
            if (i < stepNumber) {
                stepIndicator.classList.add('completed');
            } else if (i === stepNumber) {
                stepIndicator.classList.add('active');
            }
        }
    }
    
    // Helper function to get a station by ID
    function getStation(stationId) {
        return stations.find(station => station.id === stationId);
    }
    
    // Helper function to get a route by ID
    function getRoute(routeId) {
        return routes.find(route => route.id === routeId);
    }
    
    // Helper function to get a trip by ID
    function getTrip(tripId) {
        // In a real app, this would fetch from a database
        // For demonstration, we'll generate a mock trip
        return generateMockTrip(tripId);
    }
    
    // Helper function to format time (HH:MM AM/PM)
    function formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Hour '0' should be '12'
        
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${formattedMinutes} ${ampm}`;
    }
    
    // Helper function to format date (DD MMM YYYY)
    function formatDate(date) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Generate mock trips for demonstration
    function generateMockTrips(originId, destinationId, date) {
        const originStation = getStation(originId);
        const destinationStation = getStation(destinationId);
        
        // Check if the stations are on the same route
        const sharedRoutes = originStation.routes.filter(route => 
            destinationStation.routes.includes(route)
        );
        
        if (sharedRoutes.length === 0) {
            return []; // No direct route available
        }
        
        const trips = [];
        const selectedDate = new Date(date);
        
        // Generate trips throughout the day
        const startHour = 6; // 6 AM
        const endHour = 22; // 10 PM
        const routeId = sharedRoutes[0]; // Use the first shared route
        const route = getRoute(routeId);
        
        // Calculate a realistic price based on stations
        const price = calculatePrice(originId, destinationId);
        
        // Generate trips every 30 minutes
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute of [0, 30]) {
                const departureTime = new Date(selectedDate);
                departureTime.setHours(hour, minute, 0, 0);
                
                // Calculate travel time (15-30 minutes)
                const travelTime = Math.floor(15 + Math.random() * 15);
                
                const arrivalTime = new Date(departureTime);
                arrivalTime.setMinutes(arrivalTime.getMinutes() + travelTime);
                
                const tripId = `${routeId}_${originId}_${destinationId}_${departureTime.getTime()}`;
                
                const trip = new Trip(
                    tripId,
                    route,
                    originStation,
                    destinationStation,
                    departureTime,
                    arrivalTime,
                    price
                );
                
                trips.push(trip);
            }
        }
        
        return trips;
    }
    
    // Generate a mock trip by ID
    function generateMockTrip(tripId) {
        // Parse the trip ID to get the details
        const [routeId, originId, destinationId, timestamp] = tripId.split('_');
        
        const route = getRoute(routeId);
        const originStation = getStation(originId);
        const destinationStation = getStation(destinationId);
        const departureTime = new Date(parseInt(timestamp));
        
        // Calculate travel time (15-30 minutes)
        const travelTime = Math.floor(15 + Math.random() * 15);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setMinutes(arrivalTime.getMinutes() + travelTime);
        
        // Calculate price
        const price = calculatePrice(originId, destinationId);
        
        return new Trip(
            tripId,
            route,
            originStation,
            destinationStation,
            departureTime,
            arrivalTime,
            price
        );
    }
    
    // Calculate price based on stations
    function calculatePrice(originId, destinationId) {
        // In a real app, this would be based on actual distances
        // For demonstration, we'll use a simple calculation
        
        // Base fare
        let price = 2.00;
        
        // Add fare based on stations
        if (originId === 'kuching-sentral') {
            if (destinationId === 'satok' || destinationId === 'damai') {
                price = 2.00;
            } else if (destinationId === 'petra-jaya') {
                price = 3.50;
            } else if (destinationId === 'samarahan') {
                price = 5.00;
            }
        } else if (originId === 'satok') {
            if (destinationId === 'kuching-sentral') {
                price = 2.00;
            } else if (destinationId === 'petra-jaya') {
                price = 2.00;
            } else {
                price = 3.50;
            }
        } else if (originId === 'damai') {
            if (destinationId === 'kuching-sentral') {
                price = 2.00;
            } else if (destinationId === 'samarahan') {
                price = 3.50;
            } else {
                price = 3.50;
            }
        } else if (originId === 'petra-jaya') {
            if (destinationId === 'satok') {
                price = 2.00;
            } else if (destinationId === 'kuching-sentral') {
                price = 3.50;
            } else {
                price = 5.00;
            }
        } else if (originId === 'samarahan') {
            if (destinationId === 'damai') {
                price = 3.50;
            } else if (destinationId === 'kuching-sentral') {
                price = 5.00;
            } else {
                price = 5.00;
            }
        }
        
        return price;
    }
});
