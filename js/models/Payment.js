/**
 * Payment Class - Handles payment processing and management
 * Supports multiple payment methods and tracks payment status
 */
class Payment {
    constructor(paymentID, orderID, userID, amount, paymentMethod) {
        this.paymentID = paymentID;
        this.orderID = orderID;
        this.userID = userID;
        this.amount = amount;
        this.paymentMethod = paymentMethod; // 'credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'
        this.status = 'pending'; // 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
        this.transactionID = null;
        this.paymentDate = new Date();
        this.completedDate = null;
        this.failureReason = null;
        this.refundAmount = 0;
        this.processingFee = this.calculateProcessingFee();
        this.netAmount = this.amount - this.processingFee;
    }

    /**
     * Calculates processing fee based on payment method
     * @returns {number} - Processing fee amount
     */
    calculateProcessingFee() {
        const feeRates = {
            'credit_card': 0.029, // 2.9%
            'debit_card': 0.025,  // 2.5%
            'paypal': 0.034,      // 3.4%
            'bank_transfer': 0.01, // 1%
            'cash': 0             // No fee for cash
        };

        const rate = feeRates[this.paymentMethod] || 0.03; // Default 3%
        return Math.round(this.amount * rate * 100) / 100;
    }

    /**
     * Processes the payment
     * @param {Object} paymentDetails - Payment details (card info, etc.)
     * @returns {Promise<Object>} - Payment result
     */
    async processPayment(paymentDetails) {
        try {
            this.status = 'processing';
            
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Validate payment details
            const validation = this.validatePaymentDetails(paymentDetails);
            if (!validation.isValid) {
                this.status = 'failed';
                this.failureReason = validation.errors.join(', ');
                return {
                    success: false,
                    message: this.failureReason,
                    paymentID: this.paymentID
                };
            }

            // Simulate payment gateway processing
            const success = Math.random() > 0.1; // 90% success rate for simulation
            
            if (success) {
                this.status = 'completed';
                this.completedDate = new Date();
                this.transactionID = this.generateTransactionID();
                
                return {
                    success: true,
                    message: 'Payment processed successfully',
                    paymentID: this.paymentID,
                    transactionID: this.transactionID
                };
            } else {
                this.status = 'failed';
                this.failureReason = 'Payment declined by bank';
                
                return {
                    success: false,
                    message: this.failureReason,
                    paymentID: this.paymentID
                };
            }
        } catch (error) {
            this.status = 'failed';
            this.failureReason = 'System error during payment processing';
            
            return {
                success: false,
                message: this.failureReason,
                paymentID: this.paymentID
            };
        }
    }

    /**
     * Validates payment details based on payment method
     * @param {Object} details - Payment details to validate
     * @returns {Object} - Validation result
     */
    validatePaymentDetails(details) {
        const errors = [];

        switch (this.paymentMethod) {
            case 'credit_card':
            case 'debit_card':
                if (!details.cardNumber || !/^\d{13,19}$/.test(details.cardNumber.replace(/\s/g, ''))) {
                    errors.push('Invalid card number');
                }
                if (!details.expiryMonth || !details.expiryYear) {
                    errors.push('Card expiry date is required');
                }
                if (!details.cvv || !/^\d{3,4}$/.test(details.cvv)) {
                    errors.push('Invalid CVV');
                }
                if (!details.cardholderName || details.cardholderName.trim() === '') {
                    errors.push('Cardholder name is required');
                }
                break;
            
            case 'paypal':
                if (!details.email || !/\S+@\S+\.\S+/.test(details.email)) {
                    errors.push('Valid PayPal email is required');
                }
                break;
            
            case 'bank_transfer':
                if (!details.accountNumber || details.accountNumber.trim() === '') {
                    errors.push('Bank account number is required');
                }
                if (!details.routingNumber || details.routingNumber.trim() === '') {
                    errors.push('Bank routing number is required');
                }
                break;
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generates a unique transaction ID
     * @returns {string} - Transaction ID
     */
    generateTransactionID() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `TXN-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Processes a refund for this payment
     * @param {number} refundAmount - Amount to refund
     * @param {string} reason - Reason for refund
     * @returns {Object} - Refund result
     */
    processRefund(refundAmount, reason) {
        if (this.status !== 'completed') {
            return {
                success: false,
                message: 'Cannot refund a payment that is not completed'
            };
        }

        if (refundAmount <= 0 || refundAmount > (this.amount - this.refundAmount)) {
            return {
                success: false,
                message: 'Invalid refund amount'
            };
        }

        try {
            this.refundAmount += refundAmount;
            
            if (this.refundAmount >= this.amount) {
                this.status = 'refunded';
            }

            const refundID = `REF-${this.paymentID}-${Date.now()}`;
            
            return {
                success: true,
                message: 'Refund processed successfully',
                refundID: refundID,
                refundAmount: refundAmount,
                totalRefunded: this.refundAmount
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error processing refund'
            };
        }
    }

    /**
     * Cancels the payment (only if pending)
     * @returns {boolean} - True if cancellation successful
     */
    cancel() {
        if (this.status === 'pending') {
            this.status = 'cancelled';
            return true;
        }
        return false;
    }

    /**
     * Gets payment summary information
     * @returns {Object} - Payment summary
     */
    getSummary() {
        return {
            paymentID: this.paymentID,
            orderID: this.orderID,
            amount: this.amount,
            paymentMethod: this.paymentMethod,
            status: this.status,
            paymentDate: this.paymentDate,
            completedDate: this.completedDate,
            transactionID: this.transactionID,
            refundAmount: this.refundAmount
        };
    }

    /**
     * Converts payment object to JSON for storage
     * @returns {Object} - Payment data as plain object
     */
    toJSON() {
        return {
            paymentID: this.paymentID,
            orderID: this.orderID,
            userID: this.userID,
            amount: this.amount,
            paymentMethod: this.paymentMethod,
            status: this.status,
            transactionID: this.transactionID,
            paymentDate: this.paymentDate,
            completedDate: this.completedDate,
            failureReason: this.failureReason,
            refundAmount: this.refundAmount,
            processingFee: this.processingFee,
            netAmount: this.netAmount
        };
    }

    /**
     * Creates Payment instance from JSON data
     * @param {Object} data - Payment data from storage
     * @returns {Payment} - New Payment instance
     */
    static fromJSON(data) {
        const payment = new Payment(
            data.paymentID,
            data.orderID,
            data.userID,
            data.amount,
            data.paymentMethod
        );
        
        payment.status = data.status;
        payment.transactionID = data.transactionID;
        payment.paymentDate = new Date(data.paymentDate);
        payment.completedDate = data.completedDate ? new Date(data.completedDate) : null;
        payment.failureReason = data.failureReason;
        payment.refundAmount = data.refundAmount;
        payment.processingFee = data.processingFee;
        payment.netAmount = data.netAmount;
        
        return payment;
    }
}

export default Payment;
