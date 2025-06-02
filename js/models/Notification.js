/**
 * Notification Class - Handles system notifications
 * Manages user notifications, alerts, and messaging
 */
class Notification {
    constructor(notificationID, userID, title, message, type = 'info') {
        this.notificationID = notificationID;
        this.userID = userID;
        this.title = title;
        this.message = message;
        this.type = type; // 'info', 'success', 'warning', 'error', 'promotion'
        this.status = 'unread'; // 'unread', 'read', 'archived'
        this.priority = 'normal'; // 'low', 'normal', 'high', 'urgent'
        this.createdDate = new Date();
        this.readDate = null;
        this.expiryDate = null;
        this.actionURL = null; // URL for clickable notifications
        this.actionText = null; // Text for action button
        this.relatedOrderID = null;
        this.relatedTicketID = null;
        this.isSystemGenerated = true;
    }

    /**
     * Marks notification as read
     * @returns {boolean} - True if marked successfully
     */
    markAsRead() {
        if (this.status === 'unread') {
            this.status = 'read';
            this.readDate = new Date();
            return true;
        }
        return false;
    }

    /**
     * Marks notification as unread
     * @returns {boolean} - True if marked successfully
     */
    markAsUnread() {
        if (this.status === 'read') {
            this.status = 'unread';
            this.readDate = null;
            return true;
        }
        return false;
    }

    /**
     * Archives the notification
     * @returns {boolean} - True if archived successfully
     */
    archive() {
        if (['unread', 'read'].includes(this.status)) {
            this.status = 'archived';
            return true;
        }
        return false;
    }

    /**
     * Sets notification priority
     * @param {string} priority - Priority level
     * @returns {boolean} - True if priority set successfully
     */
    setPriority(priority) {
        const validPriorities = ['low', 'normal', 'high', 'urgent'];
        
        if (validPriorities.includes(priority)) {
            this.priority = priority;
            return true;
        }
        return false;
    }

    /**
     * Sets expiry date for the notification
     * @param {Date} expiryDate - Expiry date
     */
    setExpiryDate(expiryDate) {
        if (expiryDate > new Date()) {
            this.expiryDate = expiryDate;
        }
    }

    /**
     * Sets action URL and text for clickable notifications
     * @param {string} url - Action URL
     * @param {string} text - Action button text
     */
    setAction(url, text) {
        this.actionURL = url;
        this.actionText = text;
    }

    /**
     * Sets related order ID
     * @param {string} orderID - Order ID
     */
    setRelatedOrder(orderID) {
        this.relatedOrderID = orderID;
    }

    /**
     * Sets related ticket ID
     * @param {string} ticketID - Ticket ID
     */
    setRelatedTicket(ticketID) {
        this.relatedTicketID = ticketID;
    }

    /**
     * Checks if notification has expired
     * @returns {boolean} - True if expired
     */
    isExpired() {
        return this.expiryDate && new Date() > this.expiryDate;
    }

    /**
     * Gets notification age in hours
     * @returns {number} - Age in hours
     */
    getAgeInHours() {
        const now = new Date();
        const diffTime = Math.abs(now - this.createdDate);
        return Math.floor(diffTime / (1000 * 60 * 60));
    }

    /**
     * Checks if notification is urgent
     * @returns {boolean} - True if urgent
     */
    isUrgent() {
        return this.priority === 'urgent';
    }

    /**
     * Gets notification icon based on type
     * @returns {string} - Icon class or unicode
     */
    getIcon() {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'promotion': '🎉'
        };
        return icons[this.type] || icons['info'];
    }

    /**
     * Gets notification color based on type and priority
     * @returns {string} - CSS color class
     */
    getColor() {
        if (this.priority === 'urgent') return 'red';
        if (this.priority === 'high') return 'orange';
        
        const colors = {
            'info': 'blue',
            'success': 'green',
            'warning': 'yellow',
            'error': 'red',
            'promotion': 'purple'
        };
        return colors[this.type] || colors['info'];
    }

    /**
     * Validates notification data
     * @returns {Object} - Validation result with isValid flag and errors array
     */
    validate() {
        const errors = [];
        
        if (!this.title || this.title.trim() === '') {
            errors.push('Notification title is required');
        }
        
        if (!this.message || this.message.trim() === '') {
            errors.push('Notification message is required');
        }
        
        const validTypes = ['info', 'success', 'warning', 'error', 'promotion'];
        if (!validTypes.includes(this.type)) {
            errors.push('Invalid notification type');
        }
        
        const validPriorities = ['low', 'normal', 'high', 'urgent'];
        if (!validPriorities.includes(this.priority)) {
            errors.push('Invalid priority level');
        }
        
        if (this.title && this.title.length > 100) {
            errors.push('Title must be 100 characters or less');
        }
        
        if (this.message && this.message.length > 500) {
            errors.push('Message must be 500 characters or less');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Gets notification summary information
     * @returns {Object} - Notification summary
     */
    getSummary() {
        return {
            notificationID: this.notificationID,
            title: this.title,
            type: this.type,
            status: this.status,
            priority: this.priority,
            createdDate: this.createdDate,
            isExpired: this.isExpired(),
            hasAction: !!this.actionURL
        };
    }

    /**
     * Creates a notification for order status update
     * @param {string} notificationID - Notification ID
     * @param {string} userID - User ID
     * @param {string} orderID - Order ID
     * @param {string} status - Order status
     * @returns {Notification} - New notification instance
     */
    static createOrderNotification(notificationID, userID, orderID, status) {
        const statusMessages = {
            'confirmed': {
                title: 'Order Confirmed',
                message: `Your order #${orderID} has been confirmed and is being processed.`,
                type: 'success'
            },
            'completed': {
                title: 'Order Completed',
                message: `Your order #${orderID} has been completed successfully.`,
                type: 'success'
            },
            'cancelled': {
                title: 'Order Cancelled',
                message: `Your order #${orderID} has been cancelled.`,
                type: 'warning'
            },
            'refunded': {
                title: 'Order Refunded',
                message: `Your order #${orderID} has been refunded.`,
                type: 'info'
            }
        };

        const messageData = statusMessages[status] || {
            title: 'Order Update',
            message: `Your order #${orderID} status has been updated to ${status}.`,
            type: 'info'
        };

        const notification = new Notification(
            notificationID,
            userID,
            messageData.title,
            messageData.message,
            messageData.type
        );

        notification.setRelatedOrder(orderID);
        notification.setAction(`/orders/${orderID}`, 'View Order');

        return notification;
    }

    /**
     * Creates a notification for ticket booking
     * @param {string} notificationID - Notification ID
     * @param {string} userID - User ID
     * @param {string} ticketID - Ticket ID
     * @returns {Notification} - New notification instance
     */
    static createTicketNotification(notificationID, userID, ticketID) {
        const notification = new Notification(
            notificationID,
            userID,
            'Ticket Booked Successfully',
            `Your ticket #${ticketID} has been booked successfully. Please keep this for your journey.`,
            'success'
        );

        notification.setRelatedTicket(ticketID);
        notification.setAction(`/tickets/${ticketID}`, 'View Ticket');

        return notification;
    }

    /**
     * Converts notification object to JSON for storage
     * @returns {Object} - Notification data as plain object
     */
    toJSON() {
        return {
            notificationID: this.notificationID,
            userID: this.userID,
            title: this.title,
            message: this.message,
            type: this.type,
            status: this.status,
            priority: this.priority,
            createdDate: this.createdDate,
            readDate: this.readDate,
            expiryDate: this.expiryDate,
            actionURL: this.actionURL,
            actionText: this.actionText,
            relatedOrderID: this.relatedOrderID,
            relatedTicketID: this.relatedTicketID,
            isSystemGenerated: this.isSystemGenerated
        };
    }

    /**
     * Creates Notification instance from JSON data
     * @param {Object} data - Notification data from storage
     * @returns {Notification} - New Notification instance
     */
    static fromJSON(data) {
        const notification = new Notification(
            data.notificationID,
            data.userID,
            data.title,
            data.message,
            data.type
        );

        notification.status = data.status;
        notification.priority = data.priority;
        notification.createdDate = new Date(data.createdDate);
        notification.readDate = data.readDate ? new Date(data.readDate) : null;
        notification.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
        notification.actionURL = data.actionURL;
        notification.actionText = data.actionText;
        notification.relatedOrderID = data.relatedOrderID;
        notification.relatedTicketID = data.relatedTicketID;
        notification.isSystemGenerated = data.isSystemGenerated;

        return notification;
    }
}

export default Notification;
