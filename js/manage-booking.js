// manage-booking.js - Functionality for managing existing bookings

document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking manager
    const bookingManager = new BookingManager();
    
    // Get DOM elements
    const bookingSearchForm = document.getElementById('bookingSearchForm');
    const bookingReferenceInput = document.getElementById('bookingReference');
    const bookingEmailInput = document.getElementById('bookingEmail');
    const searchBookingBtn = document.getElementById('searchBookingBtn');
    const bookingResults = document.getElementById('booking-results');
    const noBookingsMessage = document.getElementById('no-bookings-message');
    
    // Modal elements
    const rescheduleModal = document.getElementById('reschedule-modal');
    const cancelModal = document.getElementById('cancel-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Reschedule form elements
    const newDateInput = document.getElementById('newDate');
    const cancelRescheduleBtn = document.getElementById('cancel-reschedule');
    const rescheduleForm = document.getElementById('rescheduleForm');
    
    // Cancel form elements
    const backFromCancelBtn = document.getElementById('back-from-cancel');
    const refundForm = document.getElementById('refundForm');
    
    // Check for booking reference in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingRefFromUrl = urlParams.get('ref');
    
    if (bookingRefFromUrl) {
        bookingReferenceInput.value = bookingRefFromUrl;
        // Auto-search if there's also an email parameter
        const emailFromUrl = urlParams.get('email');
        if (emailFromUrl) {
            bookingEmailInput.value = emailFromUrl;
            setTimeout(() => {
                searchBookingBtn.click();
            }, 500);
        }
    }
    
    // Set up search button click handler
    if (searchBookingBtn) {
        searchBookingBtn.addEventListener('click', function() {
            const bookingReference = bookingReferenceInput.value.trim();
            const bookingEmail = bookingEmailInput.value.trim();
            
            if (!bookingReference || !bookingEmail) {
                alert('Please enter both booking reference and email address.');
                return;
            }
            
            // Search for the booking (in a real app, this would query a database)
            searchBooking(bookingReference, bookingEmail);
        });
    }
    
    // Set up button click handlers
    document.addEventListener('click', function(e) {
        // View ticket button
        if (e.target && e.target.id === 'view-ticket-btn') {
            alert('This would open a printable ticket in a new window.');
        }
        
        // Reschedule button
        if (e.target && e.target.id === 'reschedule-btn') {
            openRescheduleModal();
        }
        
        // Cancel booking button
        if (e.target && e.target.id === 'cancel-btn') {
            openCancelModal();
        }
    });
    
    // Close modal buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            rescheduleModal.style.display = 'none';
            cancelModal.style.display = 'none';
        });
    });
    
    // Cancel reschedule button
    if (cancelRescheduleBtn) {
        cancelRescheduleBtn.addEventListener('click', function() {
            rescheduleModal.style.display = 'none';
        });
    }
    
    // Back from cancel button
    if (backFromCancelBtn) {
        backFromCancelBtn.addEventListener('click', function() {
            cancelModal.style.display = 'none';
        });
    }
    
    // Set minimum date for reschedule form
    if (newDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const yyyy = tomorrow.getFullYear();
        
        newDateInput.min = yyyy + '-' + mm + '-' + dd;
        
        // Set default value to tomorrow
        newDateInput.value = yyyy + '-' + mm + '-' + dd;
    }
    
    // Reschedule form submit handler
    if (rescheduleForm) {
        rescheduleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectedTrip = document.querySelector('input[name="newTrip"]:checked');
            if (!selectedTrip) {
                alert('Please select a new trip time.');
                return;
            }
            
            // Process reschedule (in a real app, this would update the database)
            rescheduleBooking(selectedTrip.value);
        });
    }
    
    // Cancel form submit handler
    if (refundForm) {
        refundForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const refundMethod = document.querySelector('input[name="refundMethod"]:checked').value;
            const cancellationReason = document.getElementById('cancellationReason').value;
            
            // Process cancellation (in a real app, this would update the database)
            cancelBooking(refundMethod, cancellationReason);
        });
    }
    
    // When new date is selected in reschedule form, load available times
    if (newDateInput) {
        newDateInput.addEventListener('change', function() {
            const newDate = this.value;
            loadAvailableRescheduleTimes(newDate);
        });
    }
    
    // Function to search for a booking
    function searchBooking(reference, email) {
        // In a real app, this would query a database
        // For demonstration, we'll create a mock booking if the reference starts with 'KCH'
        
        if (reference.toUpperCase().startsWith('KCH')) {
            // Show the booking results and hide no bookings message
            bookingResults.style.display = 'block';
            noBookingsMessage.style.display = 'none';
            
            // Update the booking details with the booking reference
            document.getElementById('result-booking-reference').textContent = reference.toUpperCase();
            
            // In a real app, other details would be populated from the database
        } else {
            // Show no bookings message and hide the booking results
            bookingResults.style.display = 'none';
            noBookingsMessage.style.display = 'block';
        }
    }
    
    // Function to open the reschedule modal
    function openRescheduleModal() {
        // Get booking details from the results section
        const fromStation = document.getElementById('result-departure-station').textContent;
        const toStation = document.getElementById('result-arrival-station').textContent;
        const departureDate = document.getElementById('result-departure-date').textContent;
        const departureTime = document.getElementById('result-departure-time').textContent;
        
        // Update the modal with these details
        document.getElementById('modal-current-from').textContent = fromStation;
        document.getElementById('modal-current-to').textContent = toStation;
        document.getElementById('modal-current-date').textContent = departureDate;
        document.getElementById('modal-current-time').textContent = departureTime;
        
        // Load available times for the default date
        loadAvailableRescheduleTimes(newDateInput.value);
        
        // Show the modal
        rescheduleModal.style.display = 'block';
    }
    
    // Function to open the cancel modal
    function openCancelModal() {
        // Get booking details from the results section
        const bookingReference = document.getElementById('result-booking-reference').textContent;
        const fromStation = document.getElementById('result-departure-station').textContent;
        const toStation = document.getElementById('result-arrival-station').textContent;
        const departureDate = document.getElementById('result-departure-date').textContent;
        const departureTime = document.getElementById('result-departure-time').textContent;
        const price = document.getElementById('result-price').textContent;
        
        // Update the modal with these details
        document.getElementById('cancel-booking-reference').textContent = bookingReference;
        document.getElementById('cancel-current-from').textContent = fromStation;
        document.getElementById('cancel-current-to').textContent = toStation;
        document.getElementById('cancel-current-date').textContent = departureDate;
        document.getElementById('cancel-current-time').textContent = departureTime;
        
        // Calculate the refund amount based on time until departure
        const refundAmount = calculateRefundAmount(departureDate, price);
        document.getElementById('refund-amount').textContent = refundAmount;
        
        // Show the modal
        cancelModal.style.display = 'block';
    }
    
    // Function to load available reschedule times
    function loadAvailableRescheduleTimes(date) {
        const availableTripsContainer = document.getElementById('reschedule-available-trips');
        
        // In a real app, this would fetch available times from a server
        // For demonstration, we'll generate some mock times
        
        // Clear previous times
        availableTripsContainer.innerHTML = '';
        
        // Generate times every 30 minutes from 7 AM to 10 PM
        const selectedDate = new Date(date);
        let tripsHTML = '';
        
        for (let hour = 7; hour <= 22; hour++) {
            for (let minute of [0, 30]) {
                const timeStr = formatTimeString(hour, minute);
                const tripId = `trip_${date}_${hour}_${minute}`;
                
                tripsHTML += `
                    <div class="schedule-item">
                        <input type="radio" name="newTrip" id="${tripId}" value="${tripId}">
                        <label for="${tripId}" class="schedule-label">
                            <div class="schedule-time">${timeStr}</div>
                            <div class="schedule-price">RM 3.50</div>
                        </label>
                    </div>
                `;
            }
        }
        
        availableTripsContainer.innerHTML = tripsHTML;
    }
    
    // Function to reschedule a booking
    function rescheduleBooking(newTripId) {
        // In a real app, this would update the booking in the database
        
        // Show a success message
        alert('Your booking has been successfully rescheduled. A confirmation email has been sent to your registered email address.');
        
        // Close the modal
        rescheduleModal.style.display = 'none';
        
        // Update the booking details on the page
        const newDate = newDateInput.value;
        const formattedDate = formatDate(new Date(newDate));
        document.getElementById('result-departure-date').textContent = formattedDate;
        
        // Extract time from the trip ID
        const tripParts = newTripId.split('_');
        const hour = parseInt(tripParts[3]);
        const minute = parseInt(tripParts[4]);
        const timeStr = formatTimeString(hour, minute);
        document.getElementById('result-departure-time').textContent = timeStr;
        
        // Update status badge to show rescheduled
        const statusBadge = document.getElementById('result-booking-status');
        statusBadge.textContent = 'Rescheduled';
        statusBadge.className = 'status-badge status-confirmed';
    }
    
    // Function to cancel a booking
    function cancelBooking(refundMethod, reason) {
        // In a real app, this would update the booking in the database
        
        // Show a success message
        alert('Your booking has been successfully cancelled. ' + 
              (refundMethod === 'original' ? 'The refund will be processed to your original payment method within 5-7 business days.' : 
               'Credit has been added to your account for future bookings.'));
        
        // Close the modal
        cancelModal.style.display = 'none';
        
        // Update the status badge to show cancelled
        const statusBadge = document.getElementById('result-booking-status');
        statusBadge.textContent = 'Cancelled';
        statusBadge.className = 'status-badge status-cancelled';
        
        // Disable the action buttons
        document.getElementById('view-ticket-btn').disabled = true;
        document.getElementById('reschedule-btn').disabled = true;
        document.getElementById('cancel-btn').disabled = true;
    }
    
    // Function to calculate refund amount based on time until departure
    function calculateRefundAmount(departureDate, price) {
        // Parse the departure date
        const departureParts = departureDate.split(' ');
        const month = getMonthNumber(departureParts[1]);
        const day = parseInt(departureParts[0]);
        const year = parseInt(departureParts[2]);
        
        const departureDateTime = new Date(year, month, day);
        const now = new Date();
        
        // Calculate days until departure
        const daysUntilDeparture = Math.ceil((departureDateTime - now) / (1000 * 60 * 60 * 24));
        
        // Extract numeric price value
        const priceValue = parseFloat(price.replace('RM ', ''));
        
        // Calculate refund based on days until departure
        let refundAmount = 0;
        
        if (daysUntilDeparture > 2) {
            refundAmount = priceValue; // 100% refund
        } else if (daysUntilDeparture >= 1) {
            refundAmount = priceValue * 0.5; // 50% refund
        } else {
            refundAmount = 0; // No refund
        }
        
        return `RM ${refundAmount.toFixed(2)}`;
    }
    
    // Helper function to get month number from abbreviation
    function getMonthNumber(monthAbbr) {
        const months = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        return months[monthAbbr];
    }
    
    // Helper function to format time string (HH:MM AM/PM)
    function formatTimeString(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const displayMinute = minute < 10 ? '0' + minute : minute;
        
        return `${displayHour}:${displayMinute} ${period}`;
    }
    
    // Helper function to format date (DD MMM YYYY)
    function formatDate(date) {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    }
});
