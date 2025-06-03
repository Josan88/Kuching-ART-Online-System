// public/Kuching-ART-Online-System/booking.js

// 1) Import only the two services you actually have:
import TicketService from '../../js/services/TicketService.js';
import PaymentService from '../../js/services/PaymentService.js';

document.addEventListener('DOMContentLoaded', () => {
  // Step containers
  const step1Content = document.getElementById('step1-content');
  const step2Content = document.getElementById('step2-content');
  const step3Content = document.getElementById('step3-content');
  const step4Content = document.getElementById('step4-content');
  const step5Content = document.getElementById('step5-content');

  // Buttons
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
    step5: document.getElementById('step5'),
  };

  // Form inputs (Step 1)
  const originSelect = document.getElementById('origin');
  const destinationSelect = document.getElementById('destination');
  const travelDateInput = document.getElementById('travel-date');
  const passengersSelect = document.getElementById('passengers');

  // Payment toggle (Step 4)
  const cardPaymentRadio = document.getElementById('card-payment');
  const eWalletPaymentRadio = document.getElementById('e-wallet-payment');
  const cardPaymentDetails = document.getElementById('card-payment-details');
  const eWalletPaymentDetails = document.getElementById('e-wallet-payment-details');

  cardPaymentRadio.addEventListener('change', () => {
    cardPaymentDetails.style.display = 'block';
    eWalletPaymentDetails.style.display = 'none';
  });
  eWalletPaymentRadio.addEventListener('change', () => {
    cardPaymentDetails.style.display = 'none';
    eWalletPaymentDetails.style.display = 'block';
  });

  // Instantiate service‐layer clients:
  const ticketService = new TicketService();
  const paymentService = new PaymentService();

  // Show only step #n, hide others
  function goToStep(n) {
    [step1Content, step2Content, step3Content, step4Content, step5Content].forEach(el => {
      if (el) el.style.display = 'none';
    });
    const show = document.getElementById(`step${n}-content`);
    if (show) show.style.display = 'block';

    // Update step indicators
    Object.keys(stepIndicators).forEach(key => {
      stepIndicators[key].classList.remove('active', 'completed');
    });
    for (let i = 1; i <= 5; i++) {
      const ind = stepIndicators[`step${i}`];
      if (!ind) continue;
      if (i < n) ind.classList.add('completed');
      else if (i === n) ind.classList.add('active');
    }
  }

  // Format a Date object as “DD MMM YYYY”
  function formatDate(date) {
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', opts);
  }

  // Format a Date object as “H:MM AM/PM”
  function formatTime(date) {
    let h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  // Step 1: When “Next: Select Trip” is clicked:
  step1NextBtn.addEventListener('click', () => {
    const origin = originSelect.value;
    const destination = destinationSelect.value;
    const travelDate = travelDateInput.value;
    const passengers = parseInt(passengersSelect.value, 10);

    if (!origin) {
      return alert('Please select an origin station.');
    }
    if (!destination) {
      return alert('Please select a destination station.');
    }
    if (origin === destination) {
      return alert('Origin and destination cannot be the same.');
    }
    if (!travelDate) {
      return alert('Please select a travel date.');
    }

    // Save Step 1 data in sessionStorage
    sessionStorage.setItem(
      'bookingData',
      JSON.stringify({ origin, destination, travelDate, passengers })
    );

    // Load Step 2 (available trips) using a mock or real fetch
    loadAvailableTrips(origin, destination, travelDate);
    goToStep(2);
  });

  // Step 2: “Previous” → Step 1
  step2PrevBtn.addEventListener('click', () => goToStep(1));

  // Step 2: “Next” → Step 3 (Passenger Info + actually book the ticket via API)
  step2NextBtn.addEventListener('click', async () => {
    const chosen = document.querySelector('input[name="trip"]:checked');
    if (!chosen) {
      return alert('Please select a trip first.');
    }
    const tripId = chosen.value;

    // Retrieve Step 1 data and append the tripId
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    bookingData.tripId = tripId;

    // Call the backend to “book” the ticket (POST /api/book-ticket)
    let bookedTicket;
    try {
      bookedTicket = await ticketService.bookTicket(bookingData);
    } catch (err) {
      return alert('Ticket booking failed: ' + err.message);
    }

    // Save returned ticket ID so we can use it later
    bookingData.ticketId = bookedTicket.id;
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Generate the passenger‐info forms based on number of passengers
    generatePassengerForms(bookingData.passengers);
    goToStep(3);
  });

  // Step 3: “Previous” → Step 2
  step3PrevBtn.addEventListener('click', () => goToStep(2));

  // Step 3: “Next” → Step 4 (Payment)
  step3NextBtn.addEventListener('click', () => {
    const formDivs = document.querySelectorAll('.passenger-form');
    const passengerDetails = [];

    formDivs.forEach((div, idx) => {
      const name = div.querySelector(`#passenger-name-${idx}`).value;
      const type = div.querySelector(`#passenger-type-${idx}`).value;
      const idNumber = div.querySelector(`#passenger-id-${idx}`).value;

      if (!name) {
        return alert(`Please enter a name for Passenger ${idx + 1}.`);
      }
      if (!type) {
        return alert(`Please select a passenger type for Passenger ${idx + 1}.`);
      }
      passengerDetails.push({ name, type, idNumber });
    });

    // Save passenger details
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    bookingData.passengerDetails = passengerDetails;
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Show a summary of trip + price in Step 4
    loadTripSummary(bookingData);
    goToStep(4);
  });

  // Step 4: “Previous” → Step 3
  step4PrevBtn.addEventListener('click', () => goToStep(3));

  // Step 4: “Proceed to Payment” → Step 5 (Confirmation)
  step4NextBtn.addEventListener('click', async () => {
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    const ticketId = bookingData.ticketId;
    const method = document.querySelector('input[name="paymentMethod"]:checked').value;
    let paymentPayload = {
      ticketId,
      userId: bookingData.userId || 'guest', // or real logged-in user
      amount: parseFloat(document.getElementById('total-price').textContent.replace('RM ', '')),
      paymentMethod: method,
    };

    if (method === 'card') {
      paymentPayload.cardInfo = {
        cardName: document.getElementById('card-name').value,
        cardNumber: document.getElementById('card-number').value,
        cardExpiry: document.getElementById('card-expiry').value,
        cardCvv: document.getElementById('card-cvv').value,
      };
      if (
        !paymentPayload.cardInfo.cardName ||
        !paymentPayload.cardInfo.cardNumber ||
        !paymentPayload.cardInfo.cardExpiry ||
        !paymentPayload.cardInfo.cardCvv
      ) {
        return alert('Please fill in all card details.');
      }
    } else {
      paymentPayload.ewalletInfo = {
        walletType: document.getElementById('wallet-type').value,
        walletNumber: document.getElementById('wallet-number').value,
      };
      if (!paymentPayload.ewalletInfo.walletType) {
        return alert('Please select an e-wallet provider.');
      }
      if (!paymentPayload.ewalletInfo.walletNumber) {
        return alert('Please enter your e-wallet phone number.');
      }
    }

    let paymentResult;
    try {
      paymentResult = await paymentService.processPayment(paymentPayload);
    } catch (err) {
      return alert('Payment failed: ' + err.message);
    }

    // Optionally save payment ID/status
    bookingData.paymentId = paymentResult.id;
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Show final confirmation
    displayConfirmation(bookingData, paymentResult);
    goToStep(5);
  });

  // Step 5: “Download Ticket” (stub)
  downloadTicketBtn.addEventListener('click', () => {
    alert('Ticket download would happen here (PDF, etc.).');
  });

  // =========================
  // Helper functions
  // =========================

  function loadAvailableTrips(origin, destination, travelDate) {
    // Clear out any existing trips
    const container = document.getElementById('available-trips');
    container.innerHTML = '';

    // In a real app, you’d call an endpoint like `/api/get-trips?origin=…&destination=…&date=…`
    // For now, we’ll use a small mock array of trips:
    const mockTrips = [
      {
        id: 'blue_' + origin + '_' + destination + '_' + Date.now(),
        origin,
        destination,
        departureTime: Date.now() + 3600 * 1000, // 1 hour from now
        arrivalTime: Date.now() + 5400 * 1000, // 1.5 hour from now
        price: 3.20,
      },
      {
        id: 'red_' + origin + '_' + destination + '_' + (Date.now() + 86400 * 1000),
        origin,
        destination,
        departureTime: Date.now() + 86400 * 1000 + 3600 * 1000,
        arrivalTime: Date.now() + 86400 * 1000 + 5400 * 1000,
        price: 4.00,
      },
    ];

    mockTrips.forEach(trip => {
      const dep = new Date(trip.departureTime);
      const arr = new Date(trip.arrivalTime);
      const html = `
        <div class="schedule-item">
          <input type="radio"
                 name="trip"
                 id="trip-${trip.id}"
                 value="${trip.id}" />
          <label for="trip-${trip.id}" class="schedule-label">
            <div class="trip-details">
              <div class="schedule-time">
                <span class="departure-time">${formatTime(dep)}</span>
                <span class="trip-duration">${Math.round((arr - dep)/60000)} min</span>
                <span class="arrival-time">${formatTime(arr)}</span>
              </div>
              <div class="schedule-stations">
                <div class="station-from">${trip.origin.replace('-', ' ').toUpperCase()}</div>
                <div class="station-to">${trip.destination.replace('-', ' ').toUpperCase()}</div>
              </div>
              <div class="schedule-price">RM ${trip.price.toFixed(2)}</div>
            </div>
          </label>
        </div>`;
      container.insertAdjacentHTML('beforeend', html);
    });

    // Once the rows exist, enable Next when any is selected:
    document.querySelectorAll('input[name="trip"]').forEach(radio => {
      radio.addEventListener('change', () => {
        step2NextBtn.disabled = false;
      });
    });
  }

  function generatePassengerForms(count) {
    const parent = document.getElementById('passenger-forms');
    parent.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const div = document.createElement('div');
      div.className = 'passenger-form';
      div.innerHTML = `
        <h4>Passenger ${i + 1}</h4>
        <div class="form-group">
          <label for="passenger-name-${i}">Full Name</label>
          <input type="text" id="passenger-name-${i}" name="passengerName${i}" required />
        </div>
        <div class="form-group">
          <label for="passenger-type-${i}">Passenger Type</label>
          <select id="passenger-type-${i}" name="passengerType${i}" required>
            <option value="">Select Passenger Type</option>
            <option value="adult">Adult</option>
            <option value="child">Child (5–12)</option>
            <option value="senior">Senior (60+)</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div class="form-group">
          <label for="passenger-id-${i}">ID Number (Optional)</label>
          <input type="text"
                 id="passenger-id-${i}"
                 name="passengerId${i}"
                 placeholder="IC / Passport / Student ID" />
        </div>`;
      parent.appendChild(div);
    }
  }

  function loadTripSummary(bookingData) {
    // We only have a mock, so we’ll reconstruct with the same mockTrips logic.
    // In real life you might call GET /api/tickets/:ticketId to get details again.
    const tripId = bookingData.tripId;
    const [_, origin, destination] = tripId.split('_');
    const mockDeparture = new Date(Date.now() + 3600 * 1000);
    const mockArrival = new Date(Date.now() + 5400 * 1000);
    const singlePrice = 3.20; // same as mockTrips above
    const totalPrice = singlePrice * bookingData.passengers;

    const summaryDiv = document.getElementById('trip-summary');
    summaryDiv.innerHTML = `
      <div class="summary-item"><span>Origin:</span><span>${origin.replace('-', ' ').toUpperCase()}</span></div>
      <div class="summary-item"><span>Destination:</span><span>${destination.replace('-', ' ').toUpperCase()}</span></div>
      <div class="summary-item"><span>Date:</span><span>${formatDate(new Date(bookingData.travelDate))}</span></div>
      <div class="summary-item"><span>Departure:</span><span>${formatTime(mockDeparture)}</span></div>
      <div class="summary-item"><span>Arrival:</span><span>${formatTime(mockArrival)}</span></div>
      <div class="summary-item"><span>Passengers:</span><span>${bookingData.passengers} × RM ${singlePrice.toFixed(2)}</span></div>`;
    document.getElementById('total-price').textContent = `RM ${totalPrice.toFixed(2)}`;
  }

  function displayConfirmation(bookingData, paymentResult) {
    document.getElementById('booking-reference').textContent = bookingData.ticketId;
    const detailsDiv = document.getElementById('confirmation-details');
    const origin = bookingData.origin.replace('-', ' ').toUpperCase();
    const dest = bookingData.destination.replace('-', ' ').toUpperCase();
    const mockDeparture = new Date(Date.now() + 3600 * 1000);
    const mockArrival = new Date(Date.now() + 5400 * 1000);
    const totalPaid = document.getElementById('total-price').textContent.replace('RM ', '');

    detailsDiv.innerHTML = `
      <div class="summary-item"><span>Route:</span><span>${origin} → ${dest}</span></div>
      <div class="summary-item"><span>Date:</span><span>${formatDate(new Date(bookingData.travelDate))}</span></div>
      <div class="summary-item"><span>Departure:</span><span>${formatTime(mockDeparture)}</span></div>
      <div class="summary-item"><span>Arrival:</span><span>${formatTime(mockArrival)}</span></div>
      <div class="summary-item"><span>Passengers:</span><span>${bookingData.passengers}</span></div>
      <div class="summary-item"><span>Total Paid:</span><span>RM ${totalPaid}</span></div>
      <div class="summary-item"><span>Payment Method:</span><span>${paymentResult.method === 'card' ? 'Card' : 'E-Wallet'}</span></div>
      <div class="summary-item"><span>Payment Status:</span><span>${paymentResult.status}</span></div>
    `;
  }

  // Kick off on Step 1
  goToStep(1);
});
