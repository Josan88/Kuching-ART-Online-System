/**
 * Admin Class - Extends User for administrative functions
 * Handles system administration, statistics, and route management
 */
import User from './User.js';

class Admin extends User {
    constructor(userID, userName, email, password, phoneNumber, address, adminLevel, department) {
        super(userID, userName, email, password, phoneNumber, address);
        this.adminLevel = adminLevel; // 1: Basic Admin, 2: Senior Admin, 3: Super Admin
        this.department = department; // e.g., "Operations", "Customer Service", "IT"
        this.lastLogin = null;
        this.permissions = this.setPermissions(adminLevel);
    }

    /**
     * Sets admin permissions based on admin level
     * @param {number} level - Admin level (1-3)
     * @returns {Object} - Permissions object
     */
    setPermissions(level) {
        const basePermissions = {
            viewUsers: true,
            viewOrders: true,
            viewReports: true
        };

        if (level >= 2) {
            basePermissions.manageRoutes = true;
            basePermissions.manageMerchandise = true;
            basePermissions.processRefunds = true;
        }

        if (level >= 3) {
            basePermissions.manageAdmins = true;
            basePermissions.systemSettings = true;
            basePermissions.deleteData = true;
        }

        return basePermissions;
    }

    /**
     * Generates system usage statistics
     * @param {Date} startDate - Start date for statistics
     * @param {Date} endDate - End date for statistics
     * @returns {Object} - Statistics data
     */
    generateStatistics(startDate, endDate) {
        if (!this.permissions.viewReports) {
            throw new Error('Insufficient permissions to generate statistics');
        }

        // This would integrate with data storage in a real system
        return {
            period: { start: startDate, end: endDate },
            totalUsers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            popularRoutes: [],
            topMerchandise: [],
            generatedBy: this.userName,
            generatedAt: new Date()
        };
    }

    /**
     * Manages route information
     * @param {string} action - Action to perform (create, update, delete)
     * @param {Object} routeData - Route data
     * @returns {boolean} - Success status
     */
    manageRoute(action, routeData) {
        if (!this.permissions.manageRoutes) {
            throw new Error('Insufficient permissions to manage routes');
        }

        try {
            switch (action) {
                case 'create':
                    // Logic to create new route
                    console.log('Creating new route:', routeData);
                    return true;
                case 'update':
                    // Logic to update existing route
                    console.log('Updating route:', routeData);
                    return true;
                case 'delete':
                    // Logic to delete route
                    console.log('Deleting route:', routeData.routeID);
                    return true;
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error managing route:', error);
            return false;
        }
    }

    /**
     * Processes refund requests
     * @param {string} orderID - Order ID to refund
     * @param {string} reason - Reason for refund
     * @returns {boolean} - Success status
     */
    processRefund(orderID, reason) {
        if (!this.permissions.processRefunds) {
            throw new Error('Insufficient permissions to process refunds');
        }

        try {
            // Logic to process refund
            console.log(`Processing refund for order ${orderID}. Reason: ${reason}`);
            return true;
        } catch (error) {
            console.error('Error processing refund:', error);
            return false;
        }
    }

    /**
     * Records admin login
     */
    recordLogin() {
        this.lastLogin = new Date();
    }

    /**
     * Converts admin object to JSON for storage
     * @returns {Object} - Admin data as plain object
     */
    toJSON() {
        const userData = super.toJSON();
        return {
            ...userData,
            adminLevel: this.adminLevel,
            department: this.department,
            lastLogin: this.lastLogin,
            permissions: this.permissions
        };
    }

    /**
     * Creates Admin instance from JSON data
     * @param {Object} data - Admin data from storage
     * @returns {Admin} - New Admin instance
     */
    static fromJSON(data) {
        const admin = new Admin(
            data.userID,
            data.userName,
            data.email,
            data.password,
            data.phoneNumber,
            data.address,
            data.adminLevel,
            data.department
        );
        admin.lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;
        return admin;
    }
}

export default Admin;
