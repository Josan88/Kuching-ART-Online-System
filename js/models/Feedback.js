/**
 * Feedback Class - Handles user feedback and reviews
 * Supports ratings, comments, and feedback management
 */
class Feedback {
    constructor(feedbackID, userID, feedbackType, subject, message, rating = null) {
        this.feedbackID = feedbackID;
        this.userID = userID;
        this.feedbackType = feedbackType; // 'service', 'route', 'merchandise', 'general', 'complaint'
        this.subject = subject;
        this.message = message;
        this.rating = rating; // 1-5 stars, null if not applicable
        this.status = 'pending'; // 'pending', 'reviewed', 'responded', 'resolved', 'closed'
        this.dateSubmitted = new Date();
        this.lastUpdated = new Date();
        this.adminResponse = null;
        this.responseDate = null;
        this.isPublic = false; // Whether feedback can be displayed publicly
        this.relatedOrderID = null; // For order-specific feedback
        this.relatedRouteID = null; // For route-specific feedback
        this.relatedMerchandiseID = null; // For merchandise-specific feedback
    }

    /**
     * Updates feedback status
     * @param {string} newStatus - New status
     * @returns {boolean} - True if status updated successfully
     */
    updateStatus(newStatus) {
        const validStatuses = ['pending', 'reviewed', 'responded', 'resolved', 'closed'];
        
        if (validStatuses.includes(newStatus)) {
            this.status = newStatus;
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Adds admin response to the feedback
     * @param {string} response - Admin response message
     * @param {string} adminID - ID of the admin responding
     * @returns {boolean} - True if response added successfully
     */
    addAdminResponse(response, adminID) {
        if (response && response.trim() !== '') {
            this.adminResponse = {
                message: response,
                adminID: adminID,
                responseDate: new Date()
            };
            this.responseDate = new Date();
            this.status = 'responded';
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Sets related order ID for order-specific feedback
     * @param {string} orderID - Order ID
     */
    setRelatedOrder(orderID) {
        this.relatedOrderID = orderID;
        this.lastUpdated = new Date();
    }

    /**
     * Sets related route ID for route-specific feedback
     * @param {string} routeID - Route ID
     */
    setRelatedRoute(routeID) {
        this.relatedRouteID = routeID;
        this.lastUpdated = new Date();
    }

    /**
     * Sets related merchandise ID for merchandise-specific feedback
     * @param {string} merchandiseID - Merchandise ID
     */
    setRelatedMerchandise(merchandiseID) {
        this.relatedMerchandiseID = merchandiseID;
        this.lastUpdated = new Date();
    }

    /**
     * Marks feedback as public (can be displayed to other users)
     */
    makePublic() {
        this.isPublic = true;
        this.lastUpdated = new Date();
    }

    /**
     * Marks feedback as private
     */
    makePrivate() {
        this.isPublic = false;
        this.lastUpdated = new Date();
    }

    /**
     * Updates the rating
     * @param {number} newRating - New rating (1-5)
     * @returns {boolean} - True if rating updated successfully
     */
    updateRating(newRating) {
        if (newRating >= 1 && newRating <= 5) {
            this.rating = newRating;
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Updates the feedback message
     * @param {string} newMessage - New message
     * @returns {boolean} - True if message updated successfully
     */
    updateMessage(newMessage) {
        if (newMessage && newMessage.trim() !== '') {
            this.message = newMessage;
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Validates feedback data
     * @returns {Object} - Validation result with isValid flag and errors array
     */
    validate() {
        const errors = [];
        
        const validFeedbackTypes = ['service', 'route', 'merchandise', 'general', 'complaint'];
        if (!this.feedbackType || !validFeedbackTypes.includes(this.feedbackType)) {
            errors.push('Valid feedback type is required');
        }
        
        if (!this.subject || this.subject.trim() === '') {
            errors.push('Subject is required');
        }
        
        if (!this.message || this.message.trim() === '') {
            errors.push('Message is required');
        }
        
        if (this.rating !== null && (this.rating < 1 || this.rating > 5)) {
            errors.push('Rating must be between 1 and 5');
        }
        
        if (this.subject && this.subject.length > 200) {
            errors.push('Subject must be 200 characters or less');
        }
        
        if (this.message && this.message.length > 2000) {
            errors.push('Message must be 2000 characters or less');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Gets feedback summary information
     * @returns {Object} - Feedback summary
     */
    getSummary() {
        return {
            feedbackID: this.feedbackID,
            feedbackType: this.feedbackType,
            subject: this.subject,
            rating: this.rating,
            status: this.status,
            dateSubmitted: this.dateSubmitted,
            hasResponse: !!this.adminResponse,
            isPublic: this.isPublic
        };
    }

    /**
     * Gets the age of the feedback in days
     * @returns {number} - Age in days
     */
    getAgeInDays() {
        const now = new Date();
        const diffTime = Math.abs(now - this.dateSubmitted);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Checks if feedback needs attention (old and unresponded)
     * @returns {boolean} - True if needs attention
     */
    needsAttention() {
        return this.status === 'pending' && this.getAgeInDays() > 3;
    }

    /**
     * Converts feedback object to JSON for storage
     * @returns {Object} - Feedback data as plain object
     */
    toJSON() {
        return {
            feedbackID: this.feedbackID,
            userID: this.userID,
            feedbackType: this.feedbackType,
            subject: this.subject,
            message: this.message,
            rating: this.rating,
            status: this.status,
            dateSubmitted: this.dateSubmitted,
            lastUpdated: this.lastUpdated,
            adminResponse: this.adminResponse,
            responseDate: this.responseDate,
            isPublic: this.isPublic,
            relatedOrderID: this.relatedOrderID,
            relatedRouteID: this.relatedRouteID,
            relatedMerchandiseID: this.relatedMerchandiseID
        };
    }

    /**
     * Creates Feedback instance from JSON data
     * @param {Object} data - Feedback data from storage
     * @returns {Feedback} - New Feedback instance
     */
    static fromJSON(data) {
        const feedback = new Feedback(
            data.feedbackID,
            data.userID,
            data.feedbackType,
            data.subject,
            data.message,
            data.rating
        );
        
        feedback.status = data.status;
        feedback.dateSubmitted = new Date(data.dateSubmitted);
        feedback.lastUpdated = new Date(data.lastUpdated);
        feedback.adminResponse = data.adminResponse;
        feedback.responseDate = data.responseDate ? new Date(data.responseDate) : null;
        feedback.isPublic = data.isPublic;
        feedback.relatedOrderID = data.relatedOrderID;
        feedback.relatedRouteID = data.relatedRouteID;
        feedback.relatedMerchandiseID = data.relatedMerchandiseID;
        
        return feedback;
    }
}

export default Feedback;
