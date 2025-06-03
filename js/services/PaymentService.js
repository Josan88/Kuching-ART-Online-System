// /js/services/PaymentService.js

export default class PaymentService {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Send a POST to /api/process-payment.  
   * Expects paymentData: { ticketId, userId, amount, paymentMethod, cardInfo?, ewalletInfo? }  
   * Returns a JSON payment object from the backend.
   */
  async processPayment(paymentData) {
    const res = await fetch(`${this.apiBaseUrl}/api/process-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`PaymentService.processPayment failed: ${res.status} ${msg}`);
    }
    return await res.json();
  }
}
