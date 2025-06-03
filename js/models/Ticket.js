/**
 * Ticket Class - Represents a transportation ticket
 * Handles ticket booking, validation, and management
 */
class Ticket {
    constructor(ticketID, routeID, userID, departureTime, price, ticketType = 'standard') {
        this.ticketID = ticketID;
        this.routeID = routeID;
        this.userID = userID;
        this.departureTime = new Date(departureTime);
        this.price = price;
        this.ticketType = ticketType; // 'standard', 'premium', 'vip'
        this.status = 'active'; // 'active', 'used', 'cancelled', 'expired'
        this.bookingDate = new Date();
        this.seatNumber = null;
        this.qrCode = this.generateQRCode();
        this.validUntil = new Date(this.departureTime.getTime() + (24 * 60 * 60 * 1000)); // Valid 24 hours after departure
    }

    /**
     * Generates a unique QR code for the ticket
     * @returns {string} - QR code string
     */
    generateQRCode() {
        const timestamp = this.bookingDate.getTime();
        const random = Math.random().toString(36).substring(2, 15);
        return `KART-${this.ticketID}-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Validates if the ticket is usable
     * @returns {Object} - Validation result with isValid flag and reason
     */
    validateTicket() {
        const now = new Date();
        
        if (this.status === 'cancelled') {
            return { isValid: false, reason: 'Ticket has been cancelled' };
        }
        
        if (this.status === 'used') {
            return { isValid: false, reason: 'Ticket has already been used' };
        }
        
        if (this.status === 'expired' || now > this.validUntil) {
            this.status = 'expired';
            return { isValid: false, reason: 'Ticket has expired' };
        }
        
        if (now > this.departureTime) {
            return { isValid: false, reason: 'Departure time has passed' };
        }
        
        return { isValid: true, reason: 'Ticket is valid' };
    }

    /**
     * Cancels the ticket
     * @returns {boolean} - True if cancellation successful
     */
    cancel() {
        if (this.status === 'active') {
            this.status = 'cancelled';
            return true;
        }
        return false;
    }

    /**
     * Marks ticket as used
     * @returns {boolean} - True if marking successful
     */
    markAsUsed() {
        const validation = this.validateTicket();
        if (validation.isValid) {
            this.status = 'used';
            return true;
        }
        return false;
    }

    /**
     * Assigns a seat number to the ticket
     * @param {string} seatNumber - Seat number to assign
     */
    assignSeat(seatNumber) {
        if (this.status === 'active') {
            this.seatNumber = seatNumber;
        }
    }

    /**
     * Calculates refund amount based on cancellation timing
     * @returns {number} - Refund amount
     */
    calculateRefund() {
        if (this.status !== 'active') {
            return 0;
        }
        
        const now = new Date();
        const hoursUntilDeparture = (this.departureTime - now) / (1000 * 60 * 60);
        
        if (hoursUntilDeparture >= 24) {
            return this.price * 0.9; // 90% refund if cancelled 24+ hours before
        } else if (hoursUntilDeparture >= 12) {
            return this.price * 0.7; // 70% refund if cancelled 12-24 hours before
        } else if (hoursUntilDeparture >= 2) {
            return this.price * 0.5; // 50% refund if cancelled 2-12 hours before
        } else {
            return 0; // No refund if cancelled less than 2 hours before
        }
    }

    /**
     * Gets ticket summary information
     * @returns {Object} - Ticket summary
     */
    getSummary() {
        return {
            ticketID: this.ticketID,
            routeID: this.routeID,
            departureTime: this.departureTime,
            price: this.price,
            status: this.status,
            seatNumber: this.seatNumber,
            qrCode: this.qrCode
        };
    }

    /**
     * Converts ticket object to JSON for storage
     * @returns {Object} - Ticket data as plain object
     */
    toJSON() {
        return {
            ticketID: this.ticketID,
            routeID: this.routeID,
            userID: this.userID,
            departureTime: this.departureTime,
            price: this.price,
            ticketType: this.ticketType,
            status: this.status,
            bookingDate: this.bookingDate,
            seatNumber: this.seatNumber,
            qrCode: this.qrCode,
            validUntil: this.validUntil
        };
    }

    /**
     * Creates Ticket instance from JSON data
     * @param {Object} data - Ticket data from storage
     * @returns {Ticket} - New Ticket instance
     */
    static fromJSON(data) {
        const ticket = new Ticket(
            data.ticketID,
            data.routeID,
            data.userID,
            data.departureTime,
            data.price,
            data.ticketType
        );
        ticket.status = data.status;
        ticket.bookingDate = new Date(data.bookingDate);
        ticket.seatNumber = data.seatNumber;
        ticket.qrCode = data.qrCode;
        ticket.validUntil = new Date(data.validUntil);
        return ticket;
    }
}

export default Ticket;
