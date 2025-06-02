/**
 * FeedbackService - Service class for managing feedback and reviews
 * Handles customer feedback, ratings, and review management
 * 
 * @author Jason
 * @version 1.0
 * @since Assignment 3 - SWE30003
 */

class FeedbackService {
    constructor(dataService) {
        this.dataService = dataService;
        this.feedbackTypes = ['route', 'service', 'merchandise', 'general', 'complaint', 'suggestion'];
        this.priorityLevels = ['low', 'medium', 'high', 'urgent'];
        this.statusTypes = ['pending', 'acknowledged', 'in_progress', 'resolved', 'closed'];
    }

    /**
     * Submit new feedback
     * @param {Object} feedbackData - Feedback data
     * @returns {Object} Submission result
     */
    async submitFeedback(feedbackData) {
        try {
            // Validate feedback data
            const validation = this.validateFeedbackData(feedbackData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: validation.message,
                    errors: validation.errors
                };
            }

            // Create feedback object
            const feedback = new Feedback({
                userId: feedbackData.userId,
                type: feedbackData.type,
                subject: feedbackData.subject,
                message: feedbackData.message,
                rating: feedbackData.rating,
                relatedItemId: feedbackData.relatedItemId,
                priority: this.determinePriority(feedbackData),
                status: 'pending',
                isAnonymous: feedbackData.isAnonymous || false
            });

            // Save feedback
            const savedFeedback = await this.dataService.save('feedback', feedback);

            // Send notification to administrators if high priority
            if (feedback.priority === 'high' || feedback.priority === 'urgent') {
                await this.notifyAdministrators(savedFeedback);
            }

            // Update user's feedback history
            await this.updateUserFeedbackHistory(feedbackData.userId, savedFeedback.id);

            return {
                success: true,
                feedback: savedFeedback,
                message: 'Feedback submitted successfully',
                referenceNumber: savedFeedback.referenceNumber
            };

        } catch (error) {
            console.error('Error submitting feedback:', error);
            return {
                success: false,
                message: 'Failed to submit feedback',
                error: error.message
            };
        }
    }

    /**
     * Validate feedback data
     * @param {Object} feedbackData - Feedback data to validate
     * @returns {Object} Validation result
     */
    validateFeedbackData(feedbackData) {
        const errors = [];

        if (!feedbackData.userId) {
            errors.push('User ID is required');
        }

        if (!feedbackData.type || !this.feedbackTypes.includes(feedbackData.type)) {
            errors.push('Valid feedback type is required');
        }

        if (!feedbackData.subject || feedbackData.subject.trim().length < 5) {
            errors.push('Subject must be at least 5 characters long');
        }

        if (!feedbackData.message || feedbackData.message.trim().length < 10) {
            errors.push('Message must be at least 10 characters long');
        }

        if (feedbackData.rating !== undefined && 
            (feedbackData.rating < 1 || feedbackData.rating > 5)) {
            errors.push('Rating must be between 1 and 5');
        }

        // Check for inappropriate content
        if (this.containsInappropriateContent(feedbackData.message) || 
            this.containsInappropriateContent(feedbackData.subject)) {
            errors.push('Content contains inappropriate language');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            message: errors.length > 0 ? errors.join(', ') : 'Feedback data is valid'
        };
    }

    /**
     * Determine feedback priority based on content and type
     * @param {Object} feedbackData - Feedback data
     * @returns {string} Priority level
     */
    determinePriority(feedbackData) {
        // High priority keywords
        const urgentKeywords = ['urgent', 'emergency', 'immediate', 'critical', 'safety'];
        const highPriorityKeywords = ['complaint', 'problem', 'issue', 'broken', 'error', 'bug'];

        const content = `${feedbackData.subject} ${feedbackData.message}`.toLowerCase();

        if (urgentKeywords.some(keyword => content.includes(keyword))) {
            return 'urgent';
        }

        if (feedbackData.type === 'complaint' || 
            highPriorityKeywords.some(keyword => content.includes(keyword))) {
            return 'high';
        }

        if (feedbackData.rating && feedbackData.rating <= 2) {
            return 'high';
        }

        if (feedbackData.type === 'suggestion') {
            return 'low';
        }

        return 'medium';
    }

    /**
     * Check for inappropriate content
     * @param {string} text - Text to check
     * @returns {boolean} Contains inappropriate content
     */
    containsInappropriateContent(text) {
        const inappropriateWords = ['spam', 'profanity']; // Simplified list
        const lowerText = text.toLowerCase();
        return inappropriateWords.some(word => lowerText.includes(word));
    }

    /**
     * Get feedback by ID
     * @param {string} feedbackId - Feedback ID
     * @returns {Object|null} Feedback item
     */
    async getFeedbackById(feedbackId) {
        try {
            const feedback = await this.dataService.getById('feedback', feedbackId);
            
            if (feedback) {
                // Add user information if not anonymous
                if (!feedback.isAnonymous && feedback.userId) {
                    const user = await this.dataService.getById('users', feedback.userId);
                    if (user) {
                        feedback.userInfo = {
                            name: user.name,
                            email: user.email
                        };
                    }
                }

                // Add related item information
                if (feedback.relatedItemId) {
                    feedback.relatedItem = await this.getRelatedItemInfo(feedback.type, feedback.relatedItemId);
                }
            }

            return feedback;

        } catch (error) {
            console.error('Error fetching feedback by ID:', error);
            return null;
        }
    }

    /**
     * Get related item information based on feedback type
     * @param {string} type - Feedback type
     * @param {string} itemId - Related item ID
     * @returns {Object|null} Related item info
     */
    async getRelatedItemInfo(type, itemId) {
        try {
            let collection = null;
            let fields = [];

            switch (type) {
                case 'route':
                    collection = 'routes';
                    fields = ['name', 'origin', 'destination'];
                    break;
                case 'merchandise':
                    collection = 'merchandise';
                    fields = ['name', 'category', 'price'];
                    break;
                case 'service':
                    collection = 'tickets';
                    fields = ['routeId', 'departureTime', 'price'];
                    break;
                default:
                    return null;
            }

            const item = await this.dataService.getById(collection, itemId);
            if (!item) return null;

            // Return only relevant fields
            const relatedInfo = {};
            fields.forEach(field => {
                if (item[field] !== undefined) {
                    relatedInfo[field] = item[field];
                }
            });

            return relatedInfo;

        } catch (error) {
            console.error('Error fetching related item info:', error);
            return null;
        }
    }

    /**
     * Get all feedback with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Object} Feedback list with pagination
     */
    async getAllFeedback(options = {}) {
        try {
            let feedback = await this.dataService.getAll('feedback');

            // Apply filters
            if (options.type) {
                feedback = feedback.filter(item => item.type === options.type);
            }

            if (options.status) {
                feedback = feedback.filter(item => item.status === options.status);
            }

            if (options.priority) {
                feedback = feedback.filter(item => item.priority === options.priority);
            }

            if (options.userId) {
                feedback = feedback.filter(item => item.userId === options.userId);
            }

            if (options.rating) {
                feedback = feedback.filter(item => item.rating === parseInt(options.rating));
            }

            if (options.startDate) {
                const startDate = new Date(options.startDate);
                feedback = feedback.filter(item => 
                    new Date(item.createdAt) >= startDate
                );
            }

            if (options.endDate) {
                const endDate = new Date(options.endDate);
                feedback = feedback.filter(item => 
                    new Date(item.createdAt) <= endDate
                );
            }

            if (options.search) {
                const searchTerm = options.search.toLowerCase();
                feedback = feedback.filter(item => 
                    item.subject.toLowerCase().includes(searchTerm) ||
                    item.message.toLowerCase().includes(searchTerm) ||
                    item.referenceNumber.toLowerCase().includes(searchTerm)
                );
            }

            // Sort by priority and date
            feedback.sort((a, b) => {
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a.priority] || 0;
                const bPriority = priorityOrder[b.priority] || 0;

                if (aPriority !== bPriority) {
                    return bPriority - aPriority; // Higher priority first
                }

                return new Date(b.createdAt) - new Date(a.createdAt); // Newer first
            });

            // Apply pagination
            const page = options.page || 1;
            const limit = options.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            return {
                feedback: feedback.slice(startIndex, endIndex),
                totalCount: feedback.length,
                currentPage: page,
                totalPages: Math.ceil(feedback.length / limit),
                filters: {
                    type: options.type,
                    status: options.status,
                    priority: options.priority,
                    rating: options.rating,
                    search: options.search
                }
            };

        } catch (error) {
            console.error('Error fetching feedback:', error);
            return {
                feedback: [],
                totalCount: 0,
                currentPage: 1,
                totalPages: 0
            };
        }
    }

    /**
     * Update feedback status
     * @param {string} feedbackId - Feedback ID
     * @param {string} newStatus - New status
     * @param {string} adminId - Admin ID making the update
     * @param {string} notes - Update notes
     * @returns {Object} Update result
     */
    async updateFeedbackStatus(feedbackId, newStatus, adminId, notes = '') {
        try {
            if (!this.statusTypes.includes(newStatus)) {
                return {
                    success: false,
                    message: 'Invalid status type'
                };
            }

            const feedback = await this.dataService.getById('feedback', feedbackId);
            if (!feedback) {
                return {
                    success: false,
                    message: 'Feedback not found'
                };
            }

            // Update feedback
            const oldStatus = feedback.status;
            feedback.status = newStatus;
            feedback.updatedAt = new Date();
            feedback.lastUpdatedBy = adminId;

            // Add status history
            if (!feedback.statusHistory) {
                feedback.statusHistory = [];
            }

            feedback.statusHistory.push({
                status: newStatus,
                previousStatus: oldStatus,
                updatedBy: adminId,
                updatedAt: new Date(),
                notes: notes
            });

            // Set resolution date if resolved
            if (newStatus === 'resolved' || newStatus === 'closed') {
                feedback.resolvedAt = new Date();
                feedback.resolvedBy = adminId;
            }

            await this.dataService.update('feedback', feedbackId, feedback);

            // Notify user of status change
            if (feedback.userId && newStatus !== oldStatus) {
                await this.notifyUserOfStatusChange(feedback.userId, feedback, newStatus, oldStatus);
            }

            return {
                success: true,
                feedback: feedback,
                message: 'Feedback status updated successfully'
            };

        } catch (error) {
            console.error('Error updating feedback status:', error);
            return {
                success: false,
                message: 'Failed to update feedback status',
                error: error.message
            };
        }
    }

    /**
     * Add response to feedback
     * @param {string} feedbackId - Feedback ID
     * @param {string} response - Response message
     * @param {string} adminId - Admin ID
     * @returns {Object} Response result
     */
    async addFeedbackResponse(feedbackId, response, adminId) {
        try {
            const feedback = await this.dataService.getById('feedback', feedbackId);
            if (!feedback) {
                return {
                    success: false,
                    message: 'Feedback not found'
                };
            }

            // Add response
            if (!feedback.responses) {
                feedback.responses = [];
            }

            const responseObj = {
                id: Date.now().toString(),
                message: response,
                respondedBy: adminId,
                respondedAt: new Date()
            };

            feedback.responses.push(responseObj);
            feedback.updatedAt = new Date();

            // Update status if still pending
            if (feedback.status === 'pending') {
                feedback.status = 'acknowledged';
            }

            await this.dataService.update('feedback', feedbackId, feedback);

            // Notify user of response
            if (feedback.userId) {
                await this.notifyUserOfResponse(feedback.userId, feedback, responseObj);
            }

            return {
                success: true,
                response: responseObj,
                feedback: feedback,
                message: 'Response added successfully'
            };

        } catch (error) {
            console.error('Error adding feedback response:', error);
            return {
                success: false,
                message: 'Failed to add response',
                error: error.message
            };
        }
    }

    /**
     * Get feedback statistics
     * @param {Object} options - Filter options
     * @returns {Object} Feedback statistics
     */
    async getFeedbackStatistics(options = {}) {
        try {
            let feedback = await this.dataService.getAll('feedback');

            // Apply date filters
            if (options.startDate) {
                const startDate = new Date(options.startDate);
                feedback = feedback.filter(item => 
                    new Date(item.createdAt) >= startDate
                );
            }

            if (options.endDate) {
                const endDate = new Date(options.endDate);
                feedback = feedback.filter(item => 
                    new Date(item.createdAt) <= endDate
                );
            }

            // Calculate statistics
            const totalFeedback = feedback.length;
            
            // Status breakdown
            const statusStats = {};
            this.statusTypes.forEach(status => {
                statusStats[status] = feedback.filter(item => item.status === status).length;
            });

            // Type breakdown
            const typeStats = {};
            this.feedbackTypes.forEach(type => {
                typeStats[type] = feedback.filter(item => item.type === type).length;
            });

            // Priority breakdown
            const priorityStats = {};
            this.priorityLevels.forEach(priority => {
                priorityStats[priority] = feedback.filter(item => item.priority === priority).length;
            });

            // Rating statistics
            const ratingsGiven = feedback.filter(item => item.rating !== undefined);
            const averageRating = ratingsGiven.length > 0 ? 
                ratingsGiven.reduce((sum, item) => sum + item.rating, 0) / ratingsGiven.length : 0;

            const ratingDistribution = {};
            for (let i = 1; i <= 5; i++) {
                ratingDistribution[i] = feedback.filter(item => item.rating === i).length;
            }

            // Response time statistics
            const respondedFeedback = feedback.filter(item => 
                item.responses && item.responses.length > 0
            );

            const averageResponseTime = this.calculateAverageResponseTime(respondedFeedback);

            // Resolution statistics
            const resolvedFeedback = feedback.filter(item => 
                item.status === 'resolved' || item.status === 'closed'
            );

            const resolutionRate = totalFeedback > 0 ? 
                (resolvedFeedback.length / totalFeedback) * 100 : 0;

            return {
                totalFeedback,
                statusStats,
                typeStats,
                priorityStats,
                averageRating: parseFloat(averageRating.toFixed(2)),
                ratingDistribution,
                responseStats: {
                    totalResponded: respondedFeedback.length,
                    responseRate: totalFeedback > 0 ? (respondedFeedback.length / totalFeedback) * 100 : 0,
                    averageResponseTimeHours: averageResponseTime
                },
                resolutionStats: {
                    totalResolved: resolvedFeedback.length,
                    resolutionRate: parseFloat(resolutionRate.toFixed(2))
                }
            };

        } catch (error) {
            console.error('Error calculating feedback statistics:', error);
            return null;
        }
    }

    /**
     * Calculate average response time in hours
     * @param {Array} respondedFeedback - Feedback with responses
     * @returns {number} Average response time in hours
     */
    calculateAverageResponseTime(respondedFeedback) {
        if (respondedFeedback.length === 0) return 0;

        const responseTimes = respondedFeedback.map(feedback => {
            const firstResponse = feedback.responses[0];
            const createdAt = new Date(feedback.createdAt);
            const respondedAt = new Date(firstResponse.respondedAt);
            return (respondedAt - createdAt) / (1000 * 60 * 60); // Hours
        });

        const totalTime = responseTimes.reduce((sum, time) => sum + time, 0);
        return parseFloat((totalTime / responseTimes.length).toFixed(2));
    }

    /**
     * Notify administrators of high priority feedback
     * @param {Object} feedback - Feedback object
     */
    async notifyAdministrators(feedback) {
        try {
            // Get all administrators
            const users = await this.dataService.getAll('users');
            const admins = users.filter(user => user.role === 'admin');

            // Create notifications for each admin
            for (const admin of admins) {
                const notification = new Notification({
                    userId: admin.id,
                    title: `High Priority Feedback Received`,
                    message: `New ${feedback.priority} priority feedback: ${feedback.subject}`,
                    type: 'alert',
                    relatedItemId: feedback.id,
                    relatedItemType: 'feedback'
                });

                await this.dataService.save('notifications', notification);
            }

        } catch (error) {
            console.error('Error notifying administrators:', error);
        }
    }

    /**
     * Notify user of status change
     * @param {string} userId - User ID
     * @param {Object} feedback - Feedback object
     * @param {string} newStatus - New status
     * @param {string} oldStatus - Previous status
     */
    async notifyUserOfStatusChange(userId, feedback, newStatus, oldStatus) {
        try {
            const notification = new Notification({
                userId: userId,
                title: 'Feedback Status Updated',
                message: `Your feedback "${feedback.subject}" status changed from ${oldStatus} to ${newStatus}`,
                type: 'info',
                relatedItemId: feedback.id,
                relatedItemType: 'feedback'
            });

            await this.dataService.save('notifications', notification);

        } catch (error) {
            console.error('Error notifying user of status change:', error);
        }
    }

    /**
     * Notify user of response
     * @param {string} userId - User ID
     * @param {Object} feedback - Feedback object
     * @param {Object} response - Response object
     */
    async notifyUserOfResponse(userId, feedback, response) {
        try {
            const notification = new Notification({
                userId: userId,
                title: 'New Response to Your Feedback',
                message: `You have received a response to your feedback: "${feedback.subject}"`,
                type: 'info',
                relatedItemId: feedback.id,
                relatedItemType: 'feedback'
            });

            await this.dataService.save('notifications', notification);

        } catch (error) {
            console.error('Error notifying user of response:', error);
        }
    }

    /**
     * Update user's feedback history
     * @param {string} userId - User ID
     * @param {string} feedbackId - Feedback ID
     */
    async updateUserFeedbackHistory(userId, feedbackId) {
        try {
            const user = await this.dataService.getById('users', userId);
            if (user) {
                if (!user.feedbackHistory) {
                    user.feedbackHistory = [];
                }
                user.feedbackHistory.push({
                    feedbackId: feedbackId,
                    submittedAt: new Date()
                });
                await this.dataService.update('users', userId, user);
            }
        } catch (error) {
            console.error('Error updating user feedback history:', error);
        }
    }

    /**
     * Get trending feedback topics
     * @param {number} days - Number of days to analyze
     * @returns {Array} Trending topics
     */
    async getTrendingTopics(days = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const feedback = await this.dataService.getAll('feedback');
            const recentFeedback = feedback.filter(item => 
                new Date(item.createdAt) >= cutoffDate
            );

            // Extract keywords from subjects and messages
            const wordCounts = {};
            const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'cannot', 'cant', 'wont', 'dont', 'doesnt', 'didnt', 'isnt', 'arent', 'wasnt', 'werent', 'havent', 'hasnt', 'hadnt'];

            recentFeedback.forEach(item => {
                const text = `${item.subject} ${item.message}`.toLowerCase();
                const words = text.match(/\b\w{3,}\b/g) || [];

                words.forEach(word => {
                    if (!stopWords.includes(word)) {
                        wordCounts[word] = (wordCounts[word] || 0) + 1;
                    }
                });
            });

            // Sort by frequency and return top topics
            const sortedTopics = Object.entries(wordCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 20)
                .map(([word, count]) => ({ topic: word, count }));

            return sortedTopics;

        } catch (error) {
            console.error('Error getting trending topics:', error);
            return [];
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackService;
}
