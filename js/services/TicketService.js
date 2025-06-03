/**
 * TicketService Class - Handles ticket-related business logic
 * Manages ticket booking, validation, and management
 */
import Ticket from '../models/Ticket.js';
import Route from '../models/Route.js';
import DataService from './DataService.js';

class TicketService {
    constructor() {
        this.dataService = new DataService();
    }

    /**
     * Books a new ticket
     * @param {Object} bookingData - Ticket booking data
     * @returns {Promise<Object>} - Booking result
     */
    async bookTicket(bookingData) {
        try {
            // Validate booking data
            const validation = this.validateBookingData(bookingData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: 'Invalid booking data',
                    errors: validation.errors
                };
            }

            // Check route availability
            const route = await this.getRouteByID(bookingData.routeID);
            if (!route || !route.isActive) {
                return {
                    success: false,
                    message: 'Route not available'
                };
            }

            // Generate ticket ID
            const ticketID = this.generateTicketID();

            // Create new ticket
            const ticket = new Ticket(
                ticketID,
                bookingData.routeID,
                bookingData.userID,
                bookingData.departureTime,
                bookingData.price,
                bookingData.ticketType || 'standard'
            );

            // Assign seat if requested
            if (bookingData.seatNumber) {
                const seatAvailable = await this.checkSeatAvailability(
                    bookingData.routeID, 
                    bookingData.departureTime, 
                    bookingData.seatNumber
                );
                
                if (seatAvailable) {
                    ticket.assignSeat(bookingData.seatNumber);
                } else {
                    return {
                        success: false,
                        message: 'Selected seat is not available'
                    };
                }
            }

            // Save ticket
            const tickets = await this.dataService.loadData('tickets') || [];
            tickets.push(ticket.toJSON());
            await this.dataService.saveData('tickets', tickets);

            return {
                success: true,
                message: 'Ticket booked successfully',
                ticket: ticket.getSummary()
            };

        } catch (error) {
            console.error('Error booking ticket:', error);
            return {
                success: false,
                message: 'Failed to book ticket due to system error'
            };
        }
    }

    /**
     * Cancels a ticket
     * @param {string} ticketID - Ticket ID to cancel
     * @param {string} userID - User ID (for authorization)
     * @returns {Promise<Object>} - Cancellation result
     */
    async cancelTicket(ticketID, userID) {
        try {
            const ticket = await this.getTicketByID(ticketID);
            
            if (!ticket) {
                return {
                    success: false,
                    message: 'Ticket not found'
                };
            }

            if (ticket.userID !== userID) {
                return {
                    success: false,
                    message: 'Unauthorized to cancel this ticket'
                };
            }

            if (ticket.cancel()) {
                await this.updateTicketInStorage(ticket);
                
                const refundAmount = ticket.calculateRefund();
                
                return {
                    success: true,
                    message: 'Ticket cancelled successfully',
                    refundAmount: refundAmount
                };
            } else {
                return {
                    success: false,
                    message: 'Ticket cannot be cancelled'
                };
            }

        } catch (error) {
            console.error('Error cancelling ticket:', error);
            return {
                success: false,
                message: 'Failed to cancel ticket'
            };
        }
    }

    /**
     * Validates a ticket for travel
     * @param {string} ticketID - Ticket ID to validate
     * @param {string} qrCode - QR code for additional validation
     * @returns {Promise<Object>} - Validation result
     */
    async validateTicketForTravel(ticketID, qrCode) {
        try {
            const ticket = await this.getTicketByID(ticketID);
            
            if (!ticket) {
                return {
                    success: false,
                    message: 'Ticket not found'
                };
            }

            if (qrCode && ticket.qrCode !== qrCode) {
                return {
                    success: false,
                    message: 'Invalid QR code'
                };
            }

            const validation = ticket.validateTicket();
            
            if (validation.isValid) {
                // Mark ticket as used
                ticket.markAsUsed();
                await this.updateTicketInStorage(ticket);
                
                return {
                    success: true,
                    message: 'Ticket validated successfully',
                    ticket: ticket.getSummary()
                };
            } else {
                return {
                    success: false,
                    message: validation.reason
                };
            }

        } catch (error) {
            console.error('Error validating ticket:', error);
            return {
                success: false,
                message: 'Failed to validate ticket'
            };
        }
    }

    /**
     * Gets ticket by ID
     * @param {string} ticketID - Ticket ID
     * @returns {Promise<Ticket|null>} - Ticket object or null
     */
    async getTicketByID(ticketID) {
        try {
            const tickets = await this.dataService.loadData('tickets') || [];
            const ticketData = tickets.find(ticket => ticket.ticketID === ticketID);
            
            return ticketData ? Ticket.fromJSON(ticketData) : null;
        } catch (error) {
            console.error('Error getting ticket:', error);
            return null;
        }
    }

    /**
     * Gets tickets by user ID
     * @param {string} userID - User ID
     * @returns {Promise<Array>} - Array of tickets
     */
    async getTicketsByUserID(userID) {
        try {
            const tickets = await this.dataService.loadData('tickets') || [];
            const userTickets = tickets
                .filter(ticket => ticket.userID === userID)
                .map(ticketData => Ticket.fromJSON(ticketData))
                .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
            
            return userTickets;
        } catch (error) {
            console.error('Error getting user tickets:', error);
            return [];
        }
    }

    /**
     * Gets available routes
     * @returns {Promise<Array>} - Array of active routes
     */
    async getAvailableRoutes() {
        try {
            const routes = await this.dataService.loadData('routes') || [];
            return routes
                .filter(route => route.isActive)
                .map(routeData => Route.fromJSON(routeData));
        } catch (error) {
            console.error('Error getting available routes:', error);
            return [];
        }
    }

    /**
     * Gets route by ID
     * @param {string} routeID - Route ID
     * @returns {Promise<Route|null>} - Route object or null
     */
    async getRouteByID(routeID) {
        try {
            const routes = await this.dataService.loadData('routes') || [];
            const routeData = routes.find(route => route.routeID === routeID);
            
            return routeData ? Route.fromJSON(routeData) : null;
        } catch (error) {
            console.error('Error getting route:', error);
            return null;
        }
    }

    /**
     * Searches for tickets based on criteria
     * @param {Object} searchCriteria - Search criteria
     * @returns {Promise<Array>} - Array of matching tickets
     */
    async searchTickets(searchCriteria) {
        try {
            const tickets = await this.dataService.loadData('tickets') || [];
            let filteredTickets = tickets.map(ticketData => Ticket.fromJSON(ticketData));

            // Apply filters
            if (searchCriteria.userID) {
                filteredTickets = filteredTickets.filter(ticket => 
                    ticket.userID === searchCriteria.userID
                );
            }

            if (searchCriteria.routeID) {
                filteredTickets = filteredTickets.filter(ticket => 
                    ticket.routeID === searchCriteria.routeID
                );
            }

            if (searchCriteria.status) {
                filteredTickets = filteredTickets.filter(ticket => 
                    ticket.status === searchCriteria.status
                );
            }

            if (searchCriteria.startDate) {
                filteredTickets = filteredTickets.filter(ticket => 
                    ticket.departureTime >= new Date(searchCriteria.startDate)
                );
            }

            if (searchCriteria.endDate) {
                filteredTickets = filteredTickets.filter(ticket => 
                    ticket.departureTime <= new Date(searchCriteria.endDate)
                );
            }

            return filteredTickets;
        } catch (error) {
            console.error('Error searching tickets:', error);
            return [];
        }
    }

    /**
     * Checks seat availability for a specific route and time
     * @param {string} routeID - Route ID
     * @param {Date} departureTime - Departure time
     * @param {string} seatNumber - Seat number to check
     * @returns {Promise<boolean>} - True if seat is available
     */
    async checkSeatAvailability(routeID, departureTime, seatNumber) {
        try {
            const tickets = await this.dataService.loadData('tickets') || [];
            
            // Check if seat is already booked for the same route and time
            const conflictingTicket = tickets.find(ticketData => {
                const ticket = Ticket.fromJSON(ticketData);
                return ticket.routeID === routeID &&
                       ticket.seatNumber === seatNumber &&
                       ticket.status === 'active' &&
                       Math.abs(new Date(ticket.departureTime) - new Date(departureTime)) < 60000; // Within 1 minute
            });

            return !conflictingTicket;
        } catch (error) {
            console.error('Error checking seat availability:', error);
            return false;
        }
    }

    /**
     * Gets available seats for a route and departure time
     * @param {string} routeID - Route ID
     * @param {Date} departureTime - Departure time
     * @returns {Promise<Array>} - Array of available seat numbers
     */
    async getAvailableSeats(routeID, departureTime) {
        try {
            // Generate all possible seats (simplified - in real system this would come from vehicle configuration)
            const allSeats = [];
            for (let i = 1; i <= 50; i++) {
                allSeats.push(i.toString().padStart(2, '0'));
            }

            const tickets = await this.dataService.loadData('tickets') || [];
            
            // Get booked seats for this route and time
            const bookedSeats = tickets
                .filter(ticketData => {
                    const ticket = Ticket.fromJSON(ticketData);
                    return ticket.routeID === routeID &&
                           ticket.status === 'active' &&
                           ticket.seatNumber &&
                           Math.abs(new Date(ticket.departureTime) - new Date(departureTime)) < 60000;
                })
                .map(ticketData => ticketData.seatNumber);

            // Return available seats
            return allSeats.filter(seat => !bookedSeats.includes(seat));
        } catch (error) {
            console.error('Error getting available seats:', error);
            return [];
        }
    }

    /**
     * Validates booking data
     * @param {Object} bookingData - Booking data to validate
     * @returns {Object} - Validation result
     */
    validateBookingData(bookingData) {
        const errors = [];

        if (!bookingData.routeID) {
            errors.push('Route ID is required');
        }

        if (!bookingData.userID) {
            errors.push('User ID is required');
        }

        if (!bookingData.departureTime) {
            errors.push('Departure time is required');
        } else {
            const departureDate = new Date(bookingData.departureTime);
            if (departureDate <= new Date()) {
                errors.push('Departure time must be in the future');
            }
        }

        if (!bookingData.price || bookingData.price <= 0) {
            errors.push('Valid ticket price is required');
        }

        const validTicketTypes = ['standard', 'premium', 'vip'];
        if (bookingData.ticketType && !validTicketTypes.includes(bookingData.ticketType)) {
            errors.push('Invalid ticket type');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Updates ticket in storage
     * @param {Ticket} ticket - Ticket to update
     * @returns {Promise<boolean>} - True if update successful
     */
    async updateTicketInStorage(ticket) {
        try {
            const tickets = await this.dataService.loadData('tickets') || [];
            const ticketIndex = tickets.findIndex(t => t.ticketID === ticket.ticketID);
            
            if (ticketIndex !== -1) {
                tickets[ticketIndex] = ticket.toJSON();
                await this.dataService.saveData('tickets', tickets);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error updating ticket in storage:', error);
            return false;
        }
    }

    /**
     * Generates a unique ticket ID
     * @returns {string} - Unique ticket ID
     */
    generateTicketID() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `TKT-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Gets ticket statistics
     * @param {Date} startDate - Start date for statistics
     * @param {Date} endDate - End date for statistics
     * @returns {Promise<Object>} - Ticket statistics
     */
    async getTicketStatistics(startDate, endDate) {
        try {
            const searchCriteria = {
                startDate: startDate,
                endDate: endDate
            };
            
            const tickets = await this.searchTickets(searchCriteria);

            const stats = {
                totalTickets: tickets.length,
                totalRevenue: 0,
                ticketsByStatus: {},
                ticketsByType: {},
                popularRoutes: {}
            };

            tickets.forEach(ticket => {
                stats.totalRevenue += ticket.price;
                
                // Count tickets by status
                stats.ticketsByStatus[ticket.status] = 
                    (stats.ticketsByStatus[ticket.status] || 0) + 1;
                
                // Count tickets by type
                stats.ticketsByType[ticket.ticketType] = 
                    (stats.ticketsByType[ticket.ticketType] || 0) + 1;
                
                // Count tickets by route
                stats.popularRoutes[ticket.routeID] = 
                    (stats.popularRoutes[ticket.routeID] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting ticket statistics:', error);
            return {
                totalTickets: 0,
                totalRevenue: 0,
                ticketsByStatus: {},
                ticketsByType: {},
                popularRoutes: {}
            };
        }
    }
}

export default TicketService;
