/**
 * NotificationService - Service class for managing notifications and messaging
 * Handles user notifications, system alerts, and communication management
 * 
 * @author Jason
 * @version 1.0
 * @since Assignment 3 - SWE30003
 */

class NotificationService {
    constructor(dataService) {
        this.dataService = dataService;
        this.notificationTypes = ['info', 'warning', 'error', 'success', 'alert', 'reminder'];
        this.channels = ['in_app', 'email', 'sms', 'push'];
        this.priorities = ['low', 'medium', 'high', 'urgent'];
    }

    /**
     * Send notification to user
     * @param {Object} notificationData - Notification data
     * @returns {Object} Send result
     */
    async sendNotification(notificationData) {
        try {
            // Validate notification data
            const validation = this.validateNotificationData(notificationData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: validation.message,
                    errors: validation.errors
                };
            }

            // Create notification object
            const notification = new Notification({
                userId: notificationData.userId,
                title: notificationData.title,
                message: notificationData.message,
                type: notificationData.type || 'info',
                priority: notificationData.priority || 'medium',
                channels: notificationData.channels || ['in_app'],
                relatedItemId: notificationData.relatedItemId,
                relatedItemType: notificationData.relatedItemType,
                scheduledFor: notificationData.scheduledFor,
                expiresAt: notificationData.expiresAt,
                actionUrl: notificationData.actionUrl,
                actionText: notificationData.actionText
            });

            // Save notification
            const savedNotification = await this.dataService.save('notifications', notification);

            // Send through specified channels
            const deliveryResults = await this.deliverNotification(savedNotification);

            // Update notification with delivery status
            savedNotification.deliveryStatus = deliveryResults;
            savedNotification.sentAt = new Date();
            await this.dataService.update('notifications', savedNotification.id, savedNotification);

            return {
                success: true,
                notification: savedNotification,
                deliveryResults: deliveryResults,
                message: 'Notification sent successfully'
            };

        } catch (error) {
            console.error('Error sending notification:', error);
            return {
                success: false,
                message: 'Failed to send notification',
                error: error.message
            };
        }
    }

    /**
     * Validate notification data
     * @param {Object} notificationData - Notification data to validate
     * @returns {Object} Validation result
     */
    validateNotificationData(notificationData) {
        const errors = [];

        if (!notificationData.userId) {
            errors.push('User ID is required');
        }

        if (!notificationData.title || notificationData.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters long');
        }

        if (!notificationData.message || notificationData.message.trim().length < 5) {
            errors.push('Message must be at least 5 characters long');
        }

        if (notificationData.type && !this.notificationTypes.includes(notificationData.type)) {
            errors.push('Invalid notification type');
        }

        if (notificationData.priority && !this.priorities.includes(notificationData.priority)) {
            errors.push('Invalid priority level');
        }

        if (notificationData.channels) {
            const invalidChannels = notificationData.channels.filter(channel => 
                !this.channels.includes(channel)
            );
            if (invalidChannels.length > 0) {
                errors.push(`Invalid channels: ${invalidChannels.join(', ')}`);
            }
        }

        if (notificationData.scheduledFor) {
            const scheduledDate = new Date(notificationData.scheduledFor);
            if (scheduledDate <= new Date()) {
                errors.push('Scheduled time must be in the future');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            message: errors.length > 0 ? errors.join(', ') : 'Notification data is valid'
        };
    }

    /**
     * Deliver notification through specified channels
     * @param {Object} notification - Notification object
     * @returns {Object} Delivery results
     */
    async deliverNotification(notification) {
        const results = {};

        for (const channel of notification.channels) {
            try {
                switch (channel) {
                    case 'in_app':
                        results[channel] = await this.deliverInApp(notification);
                        break;
                    case 'email':
                        results[channel] = await this.deliverEmail(notification);
                        break;
                    case 'sms':
                        results[channel] = await this.deliverSMS(notification);
                        break;
                    case 'push':
                        results[channel] = await this.deliverPush(notification);
                        break;
                    default:
                        results[channel] = {
                            success: false,
                            message: 'Unsupported channel'
                        };
                }
            } catch (error) {
                results[channel] = {
                    success: false,
                    message: error.message
                };
            }
        }

        return results;
    }

    /**
     * Deliver in-app notification
     * @param {Object} notification - Notification object
     * @returns {Object} Delivery result
     */
    async deliverInApp(notification) {
        // In-app notifications are stored and displayed in the UI
        return {
            success: true,
            message: 'In-app notification delivered',
            deliveredAt: new Date()
        };
    }

    /**
     * Deliver email notification (simulated)
     * @param {Object} notification - Notification object
     * @returns {Object} Delivery result
     */
    async deliverEmail(notification) {
        try {
            // Get user email
            const user = await this.dataService.getById('users', notification.userId);
            if (!user || !user.email) {
                return {
                    success: false,
                    message: 'User email not found'
                };
            }

            // Simulate email delivery
            const emailSent = await this.simulateEmailDelivery(user.email, notification);

            return {
                success: emailSent,
                message: emailSent ? 'Email delivered successfully' : 'Email delivery failed',
                deliveredAt: emailSent ? new Date() : null,
                recipient: user.email
            };

        } catch (error) {
            return {
                success: false,
                message: `Email delivery failed: ${error.message}`
            };
        }
    }

    /**
     * Deliver SMS notification (simulated)
     * @param {Object} notification - Notification object
     * @returns {Object} Delivery result
     */
    async deliverSMS(notification) {
        try {
            // Get user phone number
            const user = await this.dataService.getById('users', notification.userId);
            if (!user || !user.phone) {
                return {
                    success: false,
                    message: 'User phone number not found'
                };
            }

            // Simulate SMS delivery
            const smsSent = await this.simulateSMSDelivery(user.phone, notification);

            return {
                success: smsSent,
                message: smsSent ? 'SMS delivered successfully' : 'SMS delivery failed',
                deliveredAt: smsSent ? new Date() : null,
                recipient: user.phone
            };

        } catch (error) {
            return {
                success: false,
                message: `SMS delivery failed: ${error.message}`
            };
        }
    }

    /**
     * Deliver push notification (simulated)
     * @param {Object} notification - Notification object
     * @returns {Object} Delivery result
     */
    async deliverPush(notification) {
        try {
            // Check if user has push notifications enabled
            const user = await this.dataService.getById('users', notification.userId);
            if (!user || !user.pushNotificationsEnabled) {
                return {
                    success: false,
                    message: 'Push notifications not enabled for user'
                };
            }

            // Simulate push notification delivery
            const pushSent = await this.simulatePushDelivery(notification);

            return {
                success: pushSent,
                message: pushSent ? 'Push notification delivered successfully' : 'Push notification delivery failed',
                deliveredAt: pushSent ? new Date() : null
            };

        } catch (error) {
            return {
                success: false,
                message: `Push notification delivery failed: ${error.message}`
            };
        }
    }

    /**
     * Simulate email delivery
     * @param {string} email - Recipient email
     * @param {Object} notification - Notification object
     * @returns {boolean} Delivery success
     */
    async simulateEmailDelivery(email, notification) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 95% success rate
                resolve(Math.random() > 0.05);
            }, 500);
        });
    }

    /**
     * Simulate SMS delivery
     * @param {string} phone - Recipient phone
     * @param {Object} notification - Notification object
     * @returns {boolean} Delivery success
     */
    async simulateSMSDelivery(phone, notification) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 90% success rate for SMS
                resolve(Math.random() > 0.1);
            }, 300);
        });
    }

    /**
     * Simulate push notification delivery
     * @param {Object} notification - Notification object
     * @returns {boolean} Delivery success
     */
    async simulatePushDelivery(notification) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 98% success rate for push notifications
                resolve(Math.random() > 0.02);
            }, 200);
        });
    }

    /**
     * Get user notifications with filtering
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Object} User notifications
     */
    async getUserNotifications(userId, options = {}) {
        try {
            const allNotifications = await this.dataService.getAll('notifications');
            let userNotifications = allNotifications.filter(notification => 
                notification.userId === userId
            );

            // Apply filters
            if (options.type) {
                userNotifications = userNotifications.filter(notification => 
                    notification.type === options.type
                );
            }

            if (options.unreadOnly) {
                userNotifications = userNotifications.filter(notification => 
                    !notification.isRead
                );
            }

            if (options.priority) {
                userNotifications = userNotifications.filter(notification => 
                    notification.priority === options.priority
                );
            }

            if (options.startDate) {
                const startDate = new Date(options.startDate);
                userNotifications = userNotifications.filter(notification => 
                    new Date(notification.createdAt) >= startDate
                );
            }

            if (options.endDate) {
                const endDate = new Date(options.endDate);
                userNotifications = userNotifications.filter(notification => 
                    new Date(notification.createdAt) <= endDate
                );
            }

            // Filter out expired notifications
            const now = new Date();
            userNotifications = userNotifications.filter(notification => 
                !notification.expiresAt || new Date(notification.expiresAt) > now
            );

            // Sort by priority and date
            userNotifications.sort((a, b) => {
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

            const unreadCount = userNotifications.filter(n => !n.isRead).length;

            return {
                notifications: userNotifications.slice(startIndex, endIndex),
                totalCount: userNotifications.length,
                unreadCount: unreadCount,
                currentPage: page,
                totalPages: Math.ceil(userNotifications.length / limit)
            };

        } catch (error) {
            console.error('Error fetching user notifications:', error);
            return {
                notifications: [],
                totalCount: 0,
                unreadCount: 0,
                currentPage: 1,
                totalPages: 0
            };
        }
    }

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @param {string} userId - User ID (for security)
     * @returns {Object} Update result
     */
    async markAsRead(notificationId, userId) {
        try {
            const notification = await this.dataService.getById('notifications', notificationId);
            
            if (!notification) {
                return {
                    success: false,
                    message: 'Notification not found'
                };
            }

            if (notification.userId !== userId) {
                return {
                    success: false,
                    message: 'Unauthorized access to notification'
                };
            }

            if (notification.isRead) {
                return {
                    success: true,
                    message: 'Notification already marked as read'
                };
            }

            notification.isRead = true;
            notification.readAt = new Date();
            await this.dataService.update('notifications', notificationId, notification);

            return {
                success: true,
                notification: notification,
                message: 'Notification marked as read'
            };

        } catch (error) {
            console.error('Error marking notification as read:', error);
            return {
                success: false,
                message: 'Failed to mark notification as read',
                error: error.message
            };
        }
    }

    /**
     * Mark all notifications as read for a user
     * @param {string} userId - User ID
     * @returns {Object} Update result
     */
    async markAllAsRead(userId) {
        try {
            const allNotifications = await this.dataService.getAll('notifications');
            const userNotifications = allNotifications.filter(notification => 
                notification.userId === userId && !notification.isRead
            );

            let updatedCount = 0;

            for (const notification of userNotifications) {
                notification.isRead = true;
                notification.readAt = new Date();
                await this.dataService.update('notifications', notification.id, notification);
                updatedCount++;
            }

            return {
                success: true,
                updatedCount: updatedCount,
                message: `${updatedCount} notifications marked as read`
            };

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return {
                success: false,
                message: 'Failed to mark notifications as read',
                error: error.message
            };
        }
    }

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     * @param {string} userId - User ID (for security)
     * @returns {Object} Delete result
     */
    async deleteNotification(notificationId, userId) {
        try {
            const notification = await this.dataService.getById('notifications', notificationId);
            
            if (!notification) {
                return {
                    success: false,
                    message: 'Notification not found'
                };
            }

            if (notification.userId !== userId) {
                return {
                    success: false,
                    message: 'Unauthorized access to notification'
                };
            }

            await this.dataService.delete('notifications', notificationId);

            return {
                success: true,
                message: 'Notification deleted successfully'
            };

        } catch (error) {
            console.error('Error deleting notification:', error);
            return {
                success: false,
                message: 'Failed to delete notification',
                error: error.message
            };
        }
    }

    /**
     * Send bulk notifications to multiple users
     * @param {Array} userIds - Array of user IDs
     * @param {Object} notificationData - Notification data
     * @returns {Object} Bulk send result
     */
    async sendBulkNotifications(userIds, notificationData) {
        try {
            const results = [];
            let successCount = 0;
            let failureCount = 0;

            for (const userId of userIds) {
                const userNotificationData = {
                    ...notificationData,
                    userId: userId
                };

                const result = await this.sendNotification(userNotificationData);
                results.push({
                    userId: userId,
                    success: result.success,
                    message: result.message,
                    notificationId: result.success ? result.notification.id : null
                });

                if (result.success) {
                    successCount++;
                } else {
                    failureCount++;
                }
            }

            return {
                success: successCount > 0,
                totalSent: userIds.length,
                successCount: successCount,
                failureCount: failureCount,
                results: results,
                message: `Sent ${successCount}/${userIds.length} notifications successfully`
            };

        } catch (error) {
            console.error('Error sending bulk notifications:', error);
            return {
                success: false,
                message: 'Failed to send bulk notifications',
                error: error.message
            };
        }
    }

    /**
     * Send broadcast notification to all users
     * @param {Object} notificationData - Notification data
     * @param {Object} filters - User filters
     * @returns {Object} Broadcast result
     */
    async sendBroadcastNotification(notificationData, filters = {}) {
        try {
            // Get all users based on filters
            const allUsers = await this.dataService.getAll('users');
            let targetUsers = allUsers;

            // Apply filters
            if (filters.role) {
                targetUsers = targetUsers.filter(user => user.role === filters.role);
            }

            if (filters.status) {
                targetUsers = targetUsers.filter(user => user.status === filters.status);
            }

            if (filters.hasProfile) {
                targetUsers = targetUsers.filter(user => user.profileComplete === true);
            }

            if (filters.loyaltyLevel) {
                targetUsers = targetUsers.filter(user => 
                    this.getUserLoyaltyLevel(user.loyaltyPoints || 0) === filters.loyaltyLevel
                );
            }

            const userIds = targetUsers.map(user => user.id);

            // Send bulk notifications
            const result = await this.sendBulkNotifications(userIds, notificationData);

            return {
                ...result,
                targetUsers: targetUsers.length,
                filters: filters
            };

        } catch (error) {
            console.error('Error sending broadcast notification:', error);
            return {
                success: false,
                message: 'Failed to send broadcast notification',
                error: error.message
            };
        }
    }

    /**
     * Schedule notification for future delivery
     * @param {Object} notificationData - Notification data with scheduledFor
     * @returns {Object} Schedule result
     */
    async scheduleNotification(notificationData) {
        try {
            if (!notificationData.scheduledFor) {
                return {
                    success: false,
                    message: 'Scheduled time is required'
                };
            }

            const scheduledDate = new Date(notificationData.scheduledFor);
            if (scheduledDate <= new Date()) {
                return {
                    success: false,
                    message: 'Scheduled time must be in the future'
                };
            }

            // Create notification with scheduled status
            const notification = new Notification({
                ...notificationData,
                status: 'scheduled'
            });

            const savedNotification = await this.dataService.save('notifications', notification);

            return {
                success: true,
                notification: savedNotification,
                message: 'Notification scheduled successfully'
            };

        } catch (error) {
            console.error('Error scheduling notification:', error);
            return {
                success: false,
                message: 'Failed to schedule notification',
                error: error.message
            };
        }
    }

    /**
     * Process scheduled notifications
     * @returns {Object} Processing result
     */
    async processScheduledNotifications() {
        try {
            const allNotifications = await this.dataService.getAll('notifications');
            const now = new Date();
            
            const scheduledNotifications = allNotifications.filter(notification => 
                notification.status === 'scheduled' &&
                notification.scheduledFor &&
                new Date(notification.scheduledFor) <= now
            );

            let processedCount = 0;

            for (const notification of scheduledNotifications) {
                // Update status and send
                notification.status = 'pending';
                await this.dataService.update('notifications', notification.id, notification);

                // Deliver notification
                const deliveryResults = await this.deliverNotification(notification);
                
                // Update with delivery status
                notification.deliveryStatus = deliveryResults;
                notification.sentAt = new Date();
                notification.status = 'sent';
                await this.dataService.update('notifications', notification.id, notification);

                processedCount++;
            }

            return {
                success: true,
                processedCount: processedCount,
                message: `Processed ${processedCount} scheduled notifications`
            };

        } catch (error) {
            console.error('Error processing scheduled notifications:', error);
            return {
                success: false,
                message: 'Failed to process scheduled notifications',
                error: error.message
            };
        }
    }

    /**
     * Get notification statistics
     * @param {Object} options - Filter options
     * @returns {Object} Notification statistics
     */
    async getNotificationStatistics(options = {}) {
        try {
            let notifications = await this.dataService.getAll('notifications');

            // Apply date filters
            if (options.startDate) {
                const startDate = new Date(options.startDate);
                notifications = notifications.filter(notification => 
                    new Date(notification.createdAt) >= startDate
                );
            }

            if (options.endDate) {
                const endDate = new Date(options.endDate);
                notifications = notifications.filter(notification => 
                    new Date(notification.createdAt) <= endDate
                );
            }

            // Calculate statistics
            const totalNotifications = notifications.length;
            const readNotifications = notifications.filter(n => n.isRead).length;
            const unreadNotifications = totalNotifications - readNotifications;

            // Type breakdown
            const typeStats = {};
            this.notificationTypes.forEach(type => {
                typeStats[type] = notifications.filter(n => n.type === type).length;
            });

            // Priority breakdown
            const priorityStats = {};
            this.priorities.forEach(priority => {
                priorityStats[priority] = notifications.filter(n => n.priority === priority).length;
            });

            // Channel effectiveness
            const channelStats = {};
            this.channels.forEach(channel => {
                const channelNotifications = notifications.filter(n => 
                    n.channels && n.channels.includes(channel)
                );
                const successful = channelNotifications.filter(n => 
                    n.deliveryStatus && n.deliveryStatus[channel] && n.deliveryStatus[channel].success
                );

                channelStats[channel] = {
                    total: channelNotifications.length,
                    successful: successful.length,
                    successRate: channelNotifications.length > 0 ? 
                        (successful.length / channelNotifications.length) * 100 : 0
                };
            });

            // Read rate
            const readRate = totalNotifications > 0 ? 
                (readNotifications / totalNotifications) * 100 : 0;

            return {
                totalNotifications,
                readNotifications,
                unreadNotifications,
                readRate: parseFloat(readRate.toFixed(2)),
                typeStats,
                priorityStats,
                channelStats
            };

        } catch (error) {
            console.error('Error calculating notification statistics:', error);
            return null;
        }
    }

    /**
     * Get user loyalty level based on points
     * @param {number} points - Loyalty points
     * @returns {string} Loyalty level
     */
    getUserLoyaltyLevel(points) {
        if (points >= 1000) return 'platinum';
        if (points >= 500) return 'gold';
        if (points >= 200) return 'silver';
        return 'bronze';
    }

    /**
     * Clean up old notifications
     * @param {number} daysOld - Number of days to keep notifications
     * @returns {Object} Cleanup result
     */
    async cleanupOldNotifications(daysOld = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const allNotifications = await this.dataService.getAll('notifications');
            const oldNotifications = allNotifications.filter(notification => 
                new Date(notification.createdAt) < cutoffDate && notification.isRead
            );

            let deletedCount = 0;

            for (const notification of oldNotifications) {
                await this.dataService.delete('notifications', notification.id);
                deletedCount++;
            }

            return {
                success: true,
                deletedCount: deletedCount,
                message: `Cleaned up ${deletedCount} old notifications`
            };

        } catch (error) {
            console.error('Error cleaning up old notifications:', error);
            return {
                success: false,
                message: 'Failed to cleanup old notifications',
                error: error.message
            };
        }
    }
}

export default NotificationService;
