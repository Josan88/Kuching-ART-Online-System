// File: js/models/cancel.js

import Route from "./Route.js"; // adjust path if necessary

document.addEventListener("DOMContentLoaded", () => {
  // ─── Elements in cancel‐refund.html ───────────────────────────────────────────
  const cancelReferenceInput = document.getElementById("cancelReference");
  const cancelNameInput      = document.getElementById("cancelEmail");
  const searchCancelBtn      = document.getElementById("searchCancelBtn");

  const cancelResultsDiv     = document.getElementById("cancel-results");
  const noCancelMessageDiv   = document.getElementById("no-cancel-message");

  // Fields to populate when a booking is found:
  const foundRefSpan          = document.getElementById("found-booking-reference");
  const foundDateSpan         = document.getElementById("found-booking-date");
  const foundStatusSpan       = document.getElementById("found-booking-status");
  const foundDeptStationP     = document.getElementById("found-departure-station");
  const foundDeptTimeP        = document.getElementById("found-departure-time");
  const foundDeptDateP        = document.getElementById("found-departure-date");
  const foundArrStationP      = document.getElementById("found-arrival-station");
  const foundArrTimeP         = document.getElementById("found-arrival-time");
  const foundArrDateP         = document.getElementById("found-arrival-date");
  const foundPassengersUL     = document.getElementById("found-passengers");
  const foundPriceP           = document.getElementById("found-price");

  const cancelBookingBtn      = document.getElementById("cancel-booking-btn");
  const cancelModal           = document.getElementById("cancel-modal");
  const closeModalBtn         = document.querySelector(".close-modal");
  const backFromCancelBtn     = document.getElementById("back-from-cancel");

  // Fields inside modal:
  const cancelRefModalSpan    = document.getElementById("cancel-ref-modal");
  const cancelFromModalSpan   = document.getElementById("cancel-from-modal");
  const cancelToModalSpan     = document.getElementById("cancel-to-modal");
  const cancelDateModalSpan   = document.getElementById("cancel-date-modal");
  const cancelTimeModalSpan   = document.getElementById("cancel-time-modal");
  const cancelRefundAmtSpan   = document.getElementById("cancel-refund-amount-modal");
  const refundForm            = document.getElementById("refundForm");

  // NEW: a container for showing "Refund successful" inline
  const refundSuccessMessage  = document.createElement("p");
  refundSuccessMessage.id     = "refund-success-message";
  refundSuccessMessage.textContent = "Refund successful.";
  refundSuccessMessage.style.color = "green";
  refundSuccessMessage.style.marginTop = "1rem";
  refundSuccessMessage.style.display = "none";
  // Insert it right below the "Cancel Booking" button block:
  cancelBookingBtn.parentElement.appendChild(refundSuccessMessage);

  let currentBookingData = null;
  let currentRouteInfo   = null; // to store route text once we load it

  // ─── 1) Preload all routes (so we can map originId/destinationId → station names) ─────────
  let allRoutes = [];
  (async () => {
    try {
      allRoutes = await Route.getAllRoutes();
    } catch (err) {
      console.error("Could not load routes:", err);
    }
  })();

  // ─── 2) Search button handler ─────────────────────────────────────────────────────────
  searchCancelBtn.addEventListener("click", () => {
    // Hide any previous messages
    cancelResultsDiv.style.display   = "none";
    noCancelMessageDiv.style.display = "none";
    refundSuccessMessage.style.display = "none";

    const enteredRef  = cancelReferenceInput.value.trim();
    const enteredName = cancelNameInput.value.trim().toLowerCase();

    if (!enteredRef || !enteredName) {
      return alert("Please enter both booking reference and name.");
    }

    const raw = sessionStorage.getItem("bookingData");
    if (!raw) {
      // No booking data at all
      noCancelMessageDiv.style.display = "block";
      return;
    }

    const bookingData = JSON.parse(raw);

    // 2a) Match booking reference first
    if (bookingData.ticketId !== enteredRef) {
      noCancelMessageDiv.style.display = "block";
      return;
    }

    // 2b) Match name: we look for at least one passenger whose name matches enteredName
    const passengerMatch = bookingData.passengerDetails.some(p =>
      p.name.toLowerCase() === enteredName
    );
    if (!passengerMatch) {
      noCancelMessageDiv.style.display = "block";
      return;
    }

    // If we get here, booking is found
    currentBookingData = bookingData;

    // 3) Populate “found‐booking” fields
    foundRefSpan.textContent = bookingData.ticketId;
    // We saved only travelDate, so display that as “Booked on:”
    foundDateSpan.textContent = formatDate(new Date());

    foundStatusSpan.textContent = "Confirmed";
    foundStatusSpan.classList.remove("status-cancelled");
    foundStatusSpan.classList.add("status-confirmed");

    // 4) Look up route details from allRoutes
    const routeObj = allRoutes.find(r => r.routeID === bookingData.originId);
    if (routeObj) {
      currentRouteInfo = {
        fromStation: routeObj.startLocation,
        toStation:   routeObj.endLocation
      };
    } else {
      // fallback if route not found:
      currentRouteInfo = {
        fromStation: bookingData.originId,
        toStation:   bookingData.destinationId
      };
    }

    foundDeptStationP.textContent = currentRouteInfo.fromStation;
    foundArrStationP.textContent  = currentRouteInfo.toStation;

    // 5) Derive times from tripId (format: “<originId>_<destinationId>_<HH:MM>”)
    const parts = bookingData.tripId.split("_");
    const deptTime = parts[2] || "—";
    foundDeptTimeP.textContent = deptTime;
    foundArrTimeP.textContent  = "—"; // we don’t have arrival stored, so leave blank

    // 6) Dates: departure date is bookingData.travelDate; arrival date same
    foundDeptDateP.textContent = formatDate(new Date(bookingData.travelDate));
    foundArrDateP.textContent  = formatDate(new Date(bookingData.travelDate));

    // 7) Passengers list
    foundPassengersUL.innerHTML = "";
    bookingData.passengerDetails.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (${capitalize(p.type)})`;
      foundPassengersUL.appendChild(li);
    });

    // 8) Price
    foundPriceP.textContent = `RM ${bookingData.totalFare.toFixed(2)}`;

    // Finally, show the results section
    cancelResultsDiv.style.display = "block";
  });

  // ─── 3) “Cancel Booking” button → open modal and compute refund ─────────────────────────
  cancelBookingBtn.addEventListener("click", () => {
    if (!currentBookingData || !currentRouteInfo) return;

    // Populate modal fields
    cancelRefModalSpan.textContent  = currentBookingData.ticketId;
    cancelFromModalSpan.textContent = currentRouteInfo.fromStation;
    cancelToModalSpan.textContent   = currentRouteInfo.toStation;
    cancelDateModalSpan.textContent = formatDate(new Date(currentBookingData.travelDate));

    // Time is the same as departure time shown above
    const deptTime = currentBookingData.tripId.split("_")[2] || "—";
    cancelTimeModalSpan.textContent = deptTime;

    // Compute refund amount
    const now      = new Date();
    const travelDt = new Date(currentBookingData.travelDate);
    const msDiff   = travelDt - now;
    const hrsDiff  = msDiff / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hrsDiff >= 48) {
      refundPercent = 1.0;   // 100%
    } else if (hrsDiff >= 24) {
      refundPercent = 0.5;   // 50%
    } else {
      refundPercent = 0.0;   // no refund
    }

    const refundAmount = currentBookingData.totalFare * refundPercent;
    cancelRefundAmtSpan.textContent = `RM ${refundAmount.toFixed(2)}`;

    cancelModal.style.display = "block";
  });

  // ─── 4) Close modal (either via “×” or “Back”) ──────────────────────────────────────
  closeModalBtn.addEventListener("click", () => {
    cancelModal.style.display = "none";
  });
  backFromCancelBtn.addEventListener("click", () => {
    cancelModal.style.display = "none";
  });

  // ─── 5) Confirm cancellation inside the modal ─────────────────────────────────────
  refundForm.addEventListener("submit", e => {
    e.preventDefault();

    // Remove booking from sessionStorage:
    sessionStorage.removeItem("bookingData");

    // Update status badge on the page:
    foundStatusSpan.textContent            = "Cancelled";
    foundStatusSpan.classList.remove("status-confirmed");
    foundStatusSpan.classList.add("status-cancelled");

    // Hide the “Cancel Booking” button, since it’s now cancelled:
    cancelBookingBtn.style.display = "none";

    // Show our “Refund successful” message inline:
    refundSuccessMessage.style.display = "block";

    cancelModal.style.display = "none";

    // Still keep the pop‐up alert if desired:
    alert("Your booking has been cancelled successfully.\nRefund successful.");
  });

  // ─── Utility: Format date as “DD/MM/YYYY” ───────────────────────────────────────
  function formatDate(d) {
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const dd   = String(d.getDate()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy}`;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
