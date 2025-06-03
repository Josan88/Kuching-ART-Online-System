// ──────────────────────────────────────────────────────────────────────────────
// File: Kuching-ART-Online-System/js/models/booking.js
//
// This version:
//  • preserves the hard‐coded <option> entries in booking.html
//  • appends any routes from Route.getAllRoutes()
//  • omits all Step 5 code
// ──────────────────────────────────────────────────────────────────────────────

console.log("booking.js loaded");

import TicketService  from "../services/TicketService.js";
import PaymentService from "../services/PaymentService.js";
import Route          from "./Route.js";

document.addEventListener("DOMContentLoaded", () => {
  // ─── Step containers ─────────────────────────────────────────────────────────
  const step1Content = document.getElementById("step1-content");
  const step2Content = document.getElementById("step2-content");
  const step3Content = document.getElementById("step3-content");
  const step4Content = document.getElementById("step4-content");
  // (Step 5 removed)

  // ─── Buttons (IDs must exactly match booking.html) ─────────────────────────────
  const step1NextBtn = document.getElementById("step1-next");
  const step2PrevBtn = document.getElementById("step2-back");
  const step2NextBtn = document.getElementById("step2-next");
  const step3PrevBtn = document.getElementById("step3-prev");
  const step3NextBtn = document.getElementById("step3-next");
  const step4PrevBtn = document.getElementById("step4-prev");
  const step4NextBtn = document.getElementById("step4-next");
  // (No Step 5 buttons)

  // ─── Step indicators (for the “active” class at the top) ───────────────────────
  const steps = {
    step1: document.getElementById("step1"),
    step2: document.getElementById("step2"),
    step3: document.getElementById("step3"),
    step4: document.getElementById("step4"),
  };

  // ─── Form inputs in Step 1 ────────────────────────────────────────────────────
  const originSelect      = document.getElementById("origin");
  const destinationSelect = document.getElementById("destination");
  const travelDateInput   = document.getElementById("travel-date");
  const passengersSelect  = document.getElementById("passengers");

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

  // ─── Instantiate service-layer clients ───────────────────────────────────────
  const ticketService  = new TicketService();
  const paymentService = new PaymentService();

  // ─── Helper: Show only one step + update its “active” indicator ──────────────
  function goToStep(n) {
    [step1Content, step2Content, step3Content, step4Content].forEach(el => {
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
      default:
        step1Content.style.display = "block";
        steps.step1.classList.add("active");
    }
  }

  // ─── STEP 1: Append dynamic routes to existing <option> list ─────────────────
  (async () => {
    let allRoutes = [];
    try {
      allRoutes = await Route.getAllRoutes();
    } catch (err) {
      alert("Could not load routes: " + err.message);
      return;
    }

    // Do not clear originSelect.innerHTML or destinationSelect.innerHTML—
    // this preserves the five hard‐coded <option> entries in booking.html.
    // We simply append any additional routes here:

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

  // ─── STEP 1 → STEP 2 ─────────────────────────────────────────────────────────
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
      passengerDetails: [],   // to be filled in Step 3
      selectedTrip:     null, // to be set in Step 2
      totalFare:        0,    // to be calculated in Step 2
      paymentInfo:      null, // Step 4
      paymentResult:    null, // (Step 5 removed)
    };
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
    goToStep(2);
  });

  // ─── STEP 2 → STEP 3 ─────────────────────────────────────────────────────────
  // (In booking.html you will insert radio buttons under #available-trips.
  //  Here we simply mock a “selectedTrip” for demonstration.)
  step2NextBtn.addEventListener("click", () => {
    const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));

    // Example dummy “selectedTrip” (replace with real logic)
    bookingData.selectedTrip = {
      departureTime:    "09:00",
      arrivalTime:      "10:30",
      farePerPassenger: 5.00,
    };
    bookingData.totalFare = bookingData.selectedTrip.farePerPassenger * bookingData.passengers;
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    // Build “Passenger Info” form blocks in Step 3
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
  step2PrevBtn.addEventListener("click", () => goToStep(1));

  // ─── STEP 3 → STEP 4 ─────────────────────────────────────────────────────────
  step3NextBtn.addEventListener("click", () => {
    const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));
    bookingData.passengerDetails = [];
    const formDivs = document.querySelectorAll(".passenger-form");

    for (let idx = 0; idx < formDivs.length; idx++) {
      const div      = formDivs[idx];
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
    }

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
    goToStep(4);

    // Populate “Trip Summary” in Step 4
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
        <span>Departure:</span>
        <span>${bookingData.selectedTrip.departureTime}</span>
      </div>
      <div class="summary-item">
        <span>Arrival:</span>
        <span>${bookingData.selectedTrip.arrivalTime}</span>
      </div>
      <div class="summary-item">
        <span>Passengers:</span>
        <span>${bookingData.passengers}</span>
      </div>
    `;
    totalPriceSpan.textContent = `RM ${bookingData.totalFare.toFixed(2)}`;
  });
  step3PrevBtn.addEventListener("click", () => goToStep(2));

  // ─── STEP 4: Process Payment ─────────────────────────────────────────────────
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
        method:     "card",
        cardName,
        cardNumber,
        expiry,
        cvv,
      };
    } else {
      const walletType   = document.getElementById("wallet-type").value;
      const walletNumber = document.getElementById("wallet-number").value.trim();
      if (!walletType || !walletNumber) {
        return alert("Please fill in e-wallet type and phone number.");
      }
      paymentInfo = {
        method:       "ewallet",
        walletType,
        walletNumber,
      };
    }

    // Process payment via PaymentService
    let paymentResult;
    try {
      paymentResult = await paymentService.processPayment(
        bookingData.totalFare,
        paymentInfo
      );
    } catch (err) {
      return alert("Payment failed: " + err.message);
    }

    bookingData.paymentInfo   = paymentInfo;
    bookingData.paymentResult = paymentResult;
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    // Step 5 is removed, so just show a confirmation alert:
    alert("Payment successful! Thank you for booking.");
  });
  step4PrevBtn.addEventListener("click", () => goToStep(3));

  // ─── Helper: Format a Date object as DD/MM/YYYY ──────────────────────────────
  function formatDate(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm   = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd   = String(dateObj.getDate()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy}`;
  }

  // Start at Step 1 on page load
  goToStep(1);
});
