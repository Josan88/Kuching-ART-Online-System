// /js/services/TicketService.js

export default class TicketService {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Send a POST to /api/book-ticket.  
   * Expects bookingData: { origin, destination, travelDate, passengers, tripId }
   * Returns a JSON ticket object from the backend.
   */
  async bookTicket(bookingData) {
    const res = await fetch(`${this.apiBaseUrl}/api/book-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`TicketService.bookTicket failed: ${res.status} ${msg}`);
    }
    return await res.json();
  }
}
