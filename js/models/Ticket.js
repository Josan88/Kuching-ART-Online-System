// /js/models/Ticket.js
export default class Ticket {
  constructor({ id, routeId, origin, destination, departureTime, arrivalTime, price, status }) {
    this.id = id;
    this.routeId = routeId;
    this.origin = origin;
    this.destination = destination;
    this.departureTime = new Date(departureTime);
    this.arrivalTime = new Date(arrivalTime);
    this.price = price;
    this.status = status; // e.g. "confirmed", "cancelled", etc.
  }

  getDurationMinutes() {
    return Math.round((this.arrivalTime - this.departureTime) / 60000);
  }
}
