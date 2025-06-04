// ──────────────────────────────────────────────────────────────────────────────
// File: js/models/booking.js
// ──────────────────────────────────────────────────────────────────────────────

console.log("booking.js loaded");

import TicketService   from "../services/TicketService.js";
import PaymentService  from "../services/PaymentService.js";
import Route           from "./Route.js";
import Ticket          from "./Ticket.js";
import Order           from "./Order.js";       // ← import Order class
import Payment         from "./Payment.js";     // ← import Payment class

document.addEventListener("DOMContentLoaded", () => {
  // ─── Step containers ─────────────────────────────────────────────────────────
  const step1Content = document.getElementById("step1-content");
  const step2Content = document.getElementById("step2-content");
  const step3Content = document.getElementById("step3-content");
  const step4Content = document.getElementById("step4-content");
  const step5Content = document.getElementById("step5-content"); // ← new

  // ─── Button elements ─────────────────────────────────────────────────────────
  const step1NextBtn = document.getElementById("step1-next");
  const step2PrevBtn = document.getElementById("step2-back");
  const step2NextBtn = document.getElementById("step2-next");
  const step3PrevBtn = document.getElementById("step3-prev");
  const step3NextBtn = document.getElementById("step3-next");
  const step4PrevBtn = document.getElementById("step4-prev");
  const step4NextBtn = document.getElementById("step4-next");

  // ─── Progress‐bar indicators ─────────────────────────────────────────────────
  const steps = {
    step1: document.getElementById("step1"),
    step2: document.getElementById("step2"),
    step3: document.getElementById("step3"),
    step4: document.getElementById("step4"),
    step5: document.getElementById("step5")  // ← new
  };

  // ─── Form inputs in Step 1 ───────────────────────────────────────────────────
  const originSelect      = document.getElementById("origin");
  const destinationSelect = document.getElementById("destination");
  const travelDateInput   = document.getElementById("travel-date");
  const passengersSelect  = document.getElementById("passengers");

  // ─── Container for Step 2 trip list ──────────────────────────────────────────
  const availableTripsDiv = document.getElementById("available-trips");

  // ─── Payment toggle in Step 4 ────────────────────────────────────────────────
  const cardPaymentRadio      = document.getElementById("card-payment");
  const eWalletPaymentRadio   = document.getElementById("e-wallet-payment");
  const cardPaymentDetails    = document.getElementById("card-payment-details");
  const eWalletPaymentDetails = document.getElementById("e-wallet-payment-details");

  cardPaymentRadio.addEventListener("change", () => {
    cardPaymentDetails.style.display    = "block";
    eWalletPaymentDetails.style.display = "none";
  });
  eWalletPaymentRadio.addEventListener("change", () => {
    cardPaymentDetails.style.display    = "none";
    eWalletPaymentDetails.style.display = "block";
  });

  // ─── Service‐layer clients ───────────────────────────────────────────────────
  const ticketService  = new TicketService();
  const paymentService = new PaymentService();

  // ─── Helper: Show only one step + highlight active indicator ─────────────────
  function goToStep(n) {
    [step1Content, step2Content, step3Content, step4Content, step5Content].forEach(el => {
      el.style.display = "none";
    });
    Object.values(steps).forEach(el => el.classList.remove("active"));

    switch (n) {
      case 1:
        step1Content.style.display = "block";
        steps.step1.classList.add("active");
        break;
      case 2:
        step2Content.style.display = "block";
        steps.step2.classList.add("active");
        break;
      case 3:
        step3Content.style.display = "block";
        steps.step3.classList.add("active");
        break;
      case 4:
        step4Content.style.display = "block";
        steps.step4.classList.add("active");
        break;
      case 5:
        step5Content.style.display = "block";
        steps.step5.classList.add("active");
        break;
      default:
        step1Content.style.display = "block";
        steps.step1.classList.add("active");
    }
  }

  // ─── STEP 1: Populate Origin/Destination ──────────────────────────────────────
  (async () => {
    let allRoutes = [];
    try {
      allRoutes = await Route.getAllRoutes();
    } catch (err) {
      alert("Could not load routes: " + err.message);
      return;
    }

    // Don’t clear the hard‐coded <option> entries—just append new ones:
    allRoutes
      .filter(r => r.isActive)
      .forEach(r => {
        const label = `${r.startLocation} → ${r.endLocation}`;
        const opt1 = document.createElement("option");
        opt1.value       = r.routeID;
        opt1.textContent = label;
        originSelect.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value       = r.routeID;
        opt2.textContent = label;
        destinationSelect.appendChild(opt2);
      });
  })();

  // ─── STEP 1 → STEP 2: Next: Select Trip ──────────────────────────────────────
  step1NextBtn.addEventListener("click", () => {
    const originId      = originSelect.value;
    const destinationId = destinationSelect.value;
    const travelDate    = travelDateInput.value;
    const passengers    = parseInt(passengersSelect.value, 10);

    if (!originId) {
      return alert("Please select an origin station.");
    }
    if (!destinationId) {
      return alert("Please select a destination station.");
    }
    if (originId === destinationId) {
      return alert("Origin and destination cannot be the same.");
    }
    if (!travelDate) {
      return alert("Please pick a travel date.");
    }
    if (!passengers || passengers < 1) {
      return alert("Please select number of passengers.");
    }

    const bookingData = {
      originId,
      destinationId,
      travelDate,
      passengers,
      passengerDetails: [], // filled in Step 3
      tripId:           null,
      totalFare:        0,   // calculated in Step 3/4
      paymentInfo:      null, 
      paymentResult:    null
    };
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    populateAvailableTrips(originId, destinationId);
    goToStep(2);
  });

  step2PrevBtn.addEventListener("click", () => goToStep(1));

  // ─── STEP 2: Populate trip options ───────────────────────────────────────────
  function populateAvailableTrips(originId, destinationId) {
    availableTripsDiv.innerHTML = "";
    step2NextBtn.disabled = true;

    const dummyTrips = [
      {
        id:          `${originId}_${destinationId}_08:00`,
        departure:   "08:00",
        arrival:     "09:30",
        farePerPax:  4.50
      },
      {
        id:          `${originId}_${destinationId}_10:00`,
        departure:   "10:00",
        arrival:     "11:45",
        farePerPax:  5.00
      },
      {
        id:          `${originId}_${destinationId}_13:00`,
        departure:   "13:00",
        arrival:     "14:30",
        farePerPax:  5.50
      },
      {
        id:          `${originId}_${destinationId}_16:00`,
        departure:   "16:00",
        arrival:     "17:30",
        farePerPax:  6.00
      }
    ];

    dummyTrips.forEach((trip, idx) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("trip-option");
      wrapper.innerHTML = `
        <input
          type="radio"
          name="trip"
          id="trip-${idx}"
          value="${trip.id}"
        />
        <label for="trip-${idx}">
          Departs: ${trip.departure} — Arrives: ${trip.arrival} — Fare/pax: RM ${trip.farePerPax.toFixed(2)}
        </label>
      `;
      wrapper.querySelector("input").addEventListener("change", () => {
        step2NextBtn.disabled = false;
      });
      availableTripsDiv.appendChild(wrapper);
    });
  }

  // ─── STEP 2 → STEP 3: Book Ticket & Generate Passenger Forms ─────────────────
  step2NextBtn.addEventListener("click", async () => {
    const chosenRadio = document.querySelector('input[name="trip"]:checked');
    if (!chosenRadio) {
      return alert("Please select a trip first.");
    }
    const tripId = chosenRadio.value;

    const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));
    bookingData.tripId = tripId;

    // Book via TicketService
    let bookedTicket;
    try {
      bookedTicket = await ticketService.bookTicket(bookingData);
    } catch (err) {
      return alert("Ticket booking failed: " + err.message);
    }

    // Create Ticket instance
    const ticket = new Ticket(bookedTicket);
    console.log("Booked ticket duration (minutes):", ticket.getDurationMinutes());

    bookingData.ticketId = ticket.id;
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    // ─── CREATE AN ORDER once passenger details are known ────────────────────────
    const order = new Order(
      `ORD${Date.now()}`,            
      bookingData.userID || "GUEST"  
    );
    order.calculateTotals();
    console.log("Order subtotal (after adding items):", order.subtotal);

    // ─── Generate Passenger Info forms ─────────────────────────────────────────
    const passengerFormsDiv = document.getElementById("passenger-forms");
    passengerFormsDiv.innerHTML = "";
    for (let i = 0; i < bookingData.passengers; i++) {
      const block = document.createElement("div");
      block.classList.add("passenger-form");

      block.innerHTML = `
        <h4>Passenger ${i + 1}</h4>
        <div class="form-group">
          <label for="passenger-name-${i}">Full Name</label>
          <input type="text" id="passenger-name-${i}" required />
        </div>
        <div class="form-group">
          <label for="passenger-type-${i}">Type</label>
          <select id="passenger-type-${i}" required>
            <option value="">Select Type</option>
            <option value="adult">Adult</option>
            <option value="child">Child</option>
          </select>
        </div>
        <div class="form-group">
          <label for="passenger-id-${i}">ID Number</label>
          <input type="text" id="passenger-id-${i}" required />
        </div>
      `;
      passengerFormsDiv.appendChild(block);
    }

    goToStep(3);
  });

  // ─── STEP 3 “Previous” → go back to Step 2 ───────────────────────────────────
  step3PrevBtn.addEventListener("click", () => goToStep(2));

  // ─── STEP 3 → STEP 4: Collect Passenger Info & Show Summary ──────────────────
  step3NextBtn.addEventListener("click", () => {
    const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));
    bookingData.passengerDetails = [];

    const formDivs = document.querySelectorAll(".passenger-form");
    formDivs.forEach((div, idx) => {
      const name     = div.querySelector(`#passenger-name-${idx}`).value.trim();
      const type     = div.querySelector(`#passenger-type-${idx}`).value;
      const idNumber = div.querySelector(`#passenger-id-${idx}`).value.trim();

      if (!name) {
        return alert(`Please enter a name for Passenger ${idx + 1}.`);
      }
      if (!type) {
        return alert(`Please select a type (Adult/Child) for Passenger ${idx + 1}.`);
      }
      if (!idNumber) {
        return alert(`Please enter an ID number for Passenger ${idx + 1}.`);
      }

      bookingData.passengerDetails.push({ name, type, idNumber });
    });

    // Now display Step 4 “Trip Summary”
    const tripSummaryDiv = document.getElementById("trip-summary");
    const totalPriceSpan = document.getElementById("total-price");

    tripSummaryDiv.innerHTML = `
      <div class="summary-item">
        <span>Route:</span>
        <span>${originSelect.selectedOptions[0].textContent} → ${destinationSelect.selectedOptions[0].textContent}</span>
      </div>
      <div class="summary-item">
        <span>Date:</span>
        <span>${formatDate(new Date(bookingData.travelDate))}</span>
      </div>
      <div class="summary-item">
        <span>Passengers:</span>
        <span>${bookingData.passengers}</span>
      </div>
    `;
    const farePerPax = 5.00;
    bookingData.totalFare = farePerPax * bookingData.passengers;
    totalPriceSpan.textContent = `RM ${bookingData.totalFare.toFixed(2)}`;

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
    goToStep(4);
  });

  // ─── STEP 4 “Previous” → go back to Step 3 ───────────────────────────────────
  step4PrevBtn.addEventListener("click", () => goToStep(3));

  // ─── STEP 4 “Proceed to Payment” ─────────────────────────────────────────────
  step4NextBtn.addEventListener("click", async () => {
    const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));
    let paymentInfo = {};

    if (cardPaymentRadio.checked) {
      const cardName   = document.getElementById("card-name").value.trim();
      const cardNumber = document.getElementById("card-number").value.trim();
      const expiry     = document.getElementById("card-expiry").value.trim();
      const cvv        = document.getElementById("card-cvv").value.trim();
      if (!cardName || !cardNumber || !expiry || !cvv) {
        return alert("Please fill in all card details.");
      }
      paymentInfo = {
        paymentMethod: "card",   // ← match server’s expected field
        cardName,
        cardNumber,
        expiry,
        cvv
      };
    } else {
      const walletType   = document.getElementById("wallet-type").value;
      const walletNumber = document.getElementById("wallet-number").value.trim();
      if (!walletType || !walletNumber) {
        return alert("Please fill in e-wallet type and phone number.");
      }
      paymentInfo = {
        paymentMethod: "ewallet", // ← match server’s expected field
        walletType,
        walletNumber
      };
    }

    // Process payment
    let paymentResult;
    try {
      paymentResult = await paymentService.processPayment({
        ticketId: bookingData.ticketId,
        amount:   bookingData.totalFare,
        ...paymentInfo           // now contains paymentMethod
      });
    } catch (err) {
      return alert("Payment failed: " + err.message);
    }

    bookingData.paymentInfo   = paymentInfo;
    bookingData.paymentResult = paymentResult;

    // ─── Create a Payment instance from the raw result ─────────────────────────
    const paymentObj = new Payment({
      id:       paymentResult.id,
      ticketId: paymentResult.ticketId,
      amount:   paymentResult.amount,
      method:   paymentResult.method, // correctly populated now
      status:   paymentResult.status
    });
    console.log("Payment object:", paymentObj);
    console.log("Payment status:", paymentObj.status);
    console.log("Payment method:", paymentObj.method.toUpperCase());

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    // ─── Save this booking into localStorage under “orders” ───────────────────────
    const storedRaw = localStorage.getItem("orders") || "[]";
    let allOrders;
    try {
      allOrders = JSON.parse(storedRaw);
    } catch {
      allOrders = [];
    }

    const snapshot = {
      orderID:       `ORD${Date.now()}`,
      userID:        bookingData.userID || "GUEST",
      orderDate:     new Date().toISOString(),
      status:        "completed",
      paymentStatus: paymentObj.status,
      routeID:       bookingData.originId,
      travelDate:    bookingData.travelDate,
      passengers:    bookingData.passengers,
      totalFare:     bookingData.totalFare,
      refundAmount:  0,
      orderItems: [
        {
          itemID:    bookingData.tripId,
          itemType:  "ticket",
          quantity:  bookingData.passengers,
          unitPrice: bookingData.totalFare / bookingData.passengers,
          subtotal:  bookingData.totalFare
        }
      ]
    };

    allOrders.push(snapshot);
    localStorage.setItem("orders", JSON.stringify(allOrders));
    // ──────────────────────────────────────────────────────────────────────────────

    // ─── Move to Step 5 (Confirmation), then pop up notification ───────────────
    populateConfirmation(bookingData, paymentObj);
    goToStep(5);
    alert("Payment successful! Thank you for booking.");
  });

  // ─── Populate the Step 5 confirmation screen ─────────────────────────────────
  function populateConfirmation(bookingData, paymentObj) {
    // 1) Booking reference
    document.getElementById("booking-reference").textContent = bookingData.ticketId;

    // 2) Fill in details
    const detailsDiv = document.getElementById("confirmation-details");
    detailsDiv.innerHTML = `
      <div class="summary-item">
        <span>Route:</span>
        <span>${originSelect.selectedOptions[0].textContent} → ${destinationSelect.selectedOptions[0].textContent}</span>
      </div>
      <div class="summary-item">
        <span>Date:</span>
        <span>${formatDate(new Date(bookingData.travelDate))}</span>
      </div>
      <div class="summary-item">
        <span>Passengers:</span>
        <span>${bookingData.passengers}</span>
      </div>
      <div class="summary-item">
        <span>Payment Method:</span>
        <span>${paymentObj.method.toUpperCase()}</span>
      </div>
      <div class="summary-item">
        <span>Amount Paid:</span>
        <span>RM ${paymentObj.amount.toFixed(2)}</span>
      </div>
    `;
  }

  // ─── Helper: Format a Date as “DD/MM/YYYY” ────────────────────────────────────
  function formatDate(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm   = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd   = String(dateObj.getDate()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy}`;
  }

  // ─── Start at Step 1 on page load ─────────────────────────────────────────────
  goToStep(1);
});
