/**
 * PaymentService - Service class for managing payment operations
 * Handles payment processing, validation, and transaction management
 * 
 * @author Jason
 * @version 1.0
 * @since Assignment 3 - SWE30003
 */

class PaymentService {
    constructor(dataService) {
        this.dataService = dataService;
        this.paymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'e_wallet'];
        this.supportedCurrencies = ['MYR', 'USD', 'SGD'];
        this.transactionFees = {
            credit_card: 0.025,  // 2.5%
            debit_card: 0.015,   // 1.5%
            paypal: 0.035,       // 3.5%
            bank_transfer: 5.00, // Fixed fee
            e_wallet: 0.01       // 1%
        };
    }

    /**
     * Process a payment for an order
     * @param {Object} paymentData - Payment information
     * @param {string} orderId - Order ID to pay for
     * @returns {Object} Payment result
     */
    async processPayment(paymentData, orderId) {
        try {
            // Validate payment data
            const validation = this.validatePaymentData(paymentData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: validation.message,
                    errors: validation.errors
                };
            }

            // Get order details
            const order = await this.dataService.getById('orders', orderId);
            if (!order) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }

            // Check order status
            if (order.status !== 'pending') {
                return {
                    success: false,
                    message: 'Order is not in a payable state'
                };
            }

            // Calculate fees
            const fees = this.calculateTransactionFees(paymentData.method, order.totalAmount);
            const totalWithFees = order.totalAmount + fees;

            // Create payment record
            const payment = new Payment({
                orderId: orderId,
                userId: order.userId,
                amount: order.totalAmount,
                transactionFees: fees,
                totalAmount: totalWithFees,
                method: paymentData.method,
                currency: paymentData.currency || 'MYR',
                status: 'processing'
            });

            // Process with payment gateway (simulated)
            const gatewayResult = await this.processWithGateway(paymentData, totalWithFees);
            
            if (gatewayResult.success) {
                payment.status = 'completed';
                payment.transactionId = gatewayResult.transactionId;
                payment.gatewayResponse = gatewayResult.response;
                payment.processedAt = new Date();

                // Update order status
                order.status = 'paid';
                order.paidAt = new Date();
                await this.dataService.update('orders', orderId, order);

                // Award points if applicable
                await this.awardLoyaltyPoints(order.userId, order.totalAmount);

            } else {
                payment.status = 'failed';
                payment.failureReason = gatewayResult.error;
            }

            // Save payment record
            const savedPayment = await this.dataService.save('payments', payment);

            return {
                success: gatewayResult.success,
                payment: savedPayment,
                message: gatewayResult.success ? 'Payment processed successfully' : gatewayResult.error,
                transactionId: payment.transactionId
            };

        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                message: 'Payment processing failed',
                error: error.message
            };
        }
    }

    /**
     * Validate payment data
     * @param {Object} paymentData - Payment data to validate
     * @returns {Object} Validation result
     */
    validatePaymentData(paymentData) {
        const errors = [];

        if (!paymentData.method || !this.paymentMethods.includes(paymentData.method)) {
            errors.push('Invalid payment method');
        }

        if (paymentData.currency && !this.supportedCurrencies.includes(paymentData.currency)) {
            errors.push('Unsupported currency');
        }

        if (paymentData.method === 'credit_card' || paymentData.method === 'debit_card') {
            if (!paymentData.cardNumber || !this.validateCardNumber(paymentData.cardNumber)) {
                errors.push('Invalid card number');
            }
            if (!paymentData.expiryMonth || !paymentData.expiryYear) {
                errors.push('Card expiry date is required');
            }
            if (!paymentData.cvv || !this.validateCVV(paymentData.cvv)) {
                errors.push('Invalid CVV');
            }
            if (!paymentData.cardholderName) {
                errors.push('Cardholder name is required');
            }
        }

        if (paymentData.method === 'paypal') {
            if (!paymentData.paypalEmail || !this.validateEmail(paymentData.paypalEmail)) {
                errors.push('Valid PayPal email is required');
            }
        }

        if (paymentData.method === 'bank_transfer') {
            if (!paymentData.bankAccount || !paymentData.bankCode) {
                errors.push('Bank account details are required');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            message: errors.length > 0 ? errors.join(', ') : 'Payment data is valid'
        };
    }

    /**
     * Calculate transaction fees based on payment method
     * @param {string} method - Payment method
     * @param {number} amount - Transaction amount
     * @returns {number} Calculated fees
     */
    calculateTransactionFees(method, amount) {
        const feeRate = this.transactionFees[method] || 0;
        
        if (method === 'bank_transfer') {
            return feeRate; // Fixed fee
        }
        
        return amount * feeRate; // Percentage fee
    }

    /**
     * Process payment with gateway (simulated)
     * @param {Object} paymentData - Payment data
     * @param {number} amount - Amount to charge
     * @returns {Object} Gateway response
     */
    async processWithGateway(paymentData, amount) {
        // Simulate payment gateway processing
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 95% success rate
                const success = Math.random() > 0.05;
                
                if (success) {
                    resolve({
                        success: true,
                        transactionId: this.generateTransactionId(),
                        response: {
                            gateway: 'SimulatedGateway',
                            status: 'approved',
                            timestamp: new Date().toISOString()
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Payment declined by bank',
                        response: {
                            gateway: 'SimulatedGateway',
                            status: 'declined',
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            }, 1000); // Simulate network delay
        });
    }

    /**
     * Refund a payment
     * @param {string} paymentId - Payment ID to refund
     * @param {number} amount - Amount to refund (optional, defaults to full amount)
     * @returns {Object} Refund result
     */
    async refundPayment(paymentId, amount = null) {
        try {
            const payment = await this.dataService.getById('payments', paymentId);
            if (!payment) {
                return {
                    success: false,
                    message: 'Payment not found'
                };
            }

            if (payment.status !== 'completed') {
                return {
                    success: false,
                    message: 'Payment is not refundable'
                };
            }

            const refundAmount = amount || payment.amount;
            if (refundAmount > payment.amount) {
                return {
                    success: false,
                    message: 'Refund amount cannot exceed original payment amount'
                };
            }

            // Create refund record
            const refund = new Payment({
                originalPaymentId: paymentId,
                orderId: payment.orderId,
                userId: payment.userId,
                amount: -refundAmount,
                method: payment.method,
                currency: payment.currency,
                status: 'completed',
                type: 'refund',
                processedAt: new Date(),
                transactionId: this.generateTransactionId()
            });

            // Save refund record
            await this.dataService.save('payments', refund);

            // Update original payment
            payment.refundedAmount = (payment.refundedAmount || 0) + refundAmount;
            if (payment.refundedAmount >= payment.amount) {
                payment.status = 'refunded';
            } else {
                payment.status = 'partially_refunded';
            }
            await this.dataService.update('payments', paymentId, payment);

            return {
                success: true,
                refund: refund,
                message: 'Refund processed successfully'
            };

        } catch (error) {
            console.error('Refund processing error:', error);
            return {
                success: false,
                message: 'Refund processing failed',
                error: error.message
            };
        }
    }

    /**
     * Get payment history for a user
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Array} Payment history
     */
    async getPaymentHistory(userId, options = {}) {
        try {
            const allPayments = await this.dataService.getAll('payments');
            let userPayments = allPayments.filter(payment => payment.userId === userId);

            // Apply filters
            if (options.status) {
                userPayments = userPayments.filter(payment => payment.status === options.status);
            }

            if (options.startDate) {
                const startDate = new Date(options.startDate);
                userPayments = userPayments.filter(payment => 
                    new Date(payment.createdAt) >= startDate
                );
            }

            if (options.endDate) {
                const endDate = new Date(options.endDate);
                userPayments = userPayments.filter(payment => 
                    new Date(payment.createdAt) <= endDate
                );
            }

            // Sort by date (newest first)
            userPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Apply pagination
            const page = options.page || 1;
            const limit = options.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            return {
                payments: userPayments.slice(startIndex, endIndex),
                totalCount: userPayments.length,
                currentPage: page,
                totalPages: Math.ceil(userPayments.length / limit)
            };

        } catch (error) {
            console.error('Error fetching payment history:', error);
            return {
                payments: [],
                totalCount: 0,
                currentPage: 1,
                totalPages: 0
            };
        }
    }

    /**
     * Award loyalty points for payment
     * @param {string} userId - User ID
     * @param {number} amount - Payment amount
     */
    async awardLoyaltyPoints(userId, amount) {
        try {
            // Award 1 point per RM spent
            const points = Math.floor(amount);
            
            if (points > 0) {
                const pointsEntry = new PointsLedger({
                    userId: userId,
                    points: points,
                    type: 'earned',
                    source: 'purchase',
                    description: `Points earned from purchase of RM${amount.toFixed(2)}`
                });

                await this.dataService.save('pointsLedger', pointsEntry);

                // Update user's total points
                const user = await this.dataService.getById('users', userId);
                if (user) {
                    user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
                    await this.dataService.update('users', userId, user);
                }
            }
        } catch (error) {
            console.error('Error awarding loyalty points:', error);
        }
    }

    /**
     * Generate transaction ID
     * @returns {string} Transaction ID
     */
    generateTransactionId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN${timestamp}${random}`;
    }

    /**
     * Validate credit card number using Luhn algorithm
     * @param {string} cardNumber - Card number to validate
     * @returns {boolean} Is valid
     */
    validateCardNumber(cardNumber) {
        const number = cardNumber.replace(/\D/g, '');
        if (number.length < 13 || number.length > 19) return false;

        let sum = 0;
        let isEven = false;

        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Validate CVV
     * @param {string} cvv - CVV to validate
     * @returns {boolean} Is valid
     */
    validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Get payment statistics
     * @param {Object} options - Filter options
     * @returns {Object} Payment statistics
     */
    async getPaymentStatistics(options = {}) {
        try {
            const allPayments = await this.dataService.getAll('payments');
            let payments = allPayments.filter(payment => payment.type !== 'refund');

            // Apply date filters
            if (options.startDate) {
                const startDate = new Date(options.startDate);
                payments = payments.filter(payment => 
                    new Date(payment.createdAt) >= startDate
                );
            }

            if (options.endDate) {
                const endDate = new Date(options.endDate);
                payments = payments.filter(payment => 
                    new Date(payment.createdAt) <= endDate
                );
            }

            // Calculate statistics
            const totalTransactions = payments.length;
            const completedPayments = payments.filter(p => p.status === 'completed');
            const failedPayments = payments.filter(p => p.status === 'failed');
            
            const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
            const totalFees = completedPayments.reduce((sum, p) => sum + (p.transactionFees || 0), 0);
            
            const successRate = totalTransactions > 0 ? 
                (completedPayments.length / totalTransactions) * 100 : 0;

            // Payment method breakdown
            const methodBreakdown = {};
            this.paymentMethods.forEach(method => {
                const methodPayments = completedPayments.filter(p => p.method === method);
                methodBreakdown[method] = {
                    count: methodPayments.length,
                    revenue: methodPayments.reduce((sum, p) => sum + p.amount, 0)
                };
            });

            return {
                totalTransactions,
                completedTransactions: completedPayments.length,
                failedTransactions: failedPayments.length,
                totalRevenue,
                totalFees,
                netRevenue: totalRevenue - totalFees,
                successRate: parseFloat(successRate.toFixed(2)),
                methodBreakdown
            };

        } catch (error) {
            console.error('Error calculating payment statistics:', error);
            return null;
        }
    }
}

export default PaymentService;
