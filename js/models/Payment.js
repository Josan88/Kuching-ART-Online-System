// /js/models/Payment.js
export default class Payment {
  constructor({ id, ticketId, amount, method, status }) {
    this.id = id;
    this.ticketId = ticketId;
    this.amount = amount;
    this.method = method;   // e.g. "card" or "ewallet"
    this.status = status;   // e.g. "pending", "completed", "failed"
  }
}
