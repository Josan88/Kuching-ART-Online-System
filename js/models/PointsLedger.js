/**
 * PointsLedger Class - Manages user loyalty points
 * Tracks points earned, spent, and balances
 */
class PointsLedger {
    constructor(ledgerID, userID) {
        this.ledgerID = ledgerID;
        this.userID = userID;
        this.currentBalance = 0;
        this.totalEarned = 0;
        this.totalSpent = 0;
        this.transactions = [];
        this.createdDate = new Date();
        this.lastUpdated = new Date();
    }

    /**
     * Adds points to the user's account
     * @param {number} points - Points to add
     * @param {string} reason - Reason for earning points
     * @param {string} referenceID - Reference ID (orderID, etc.)
     * @returns {boolean} - True if points added successfully
     */
    addPoints(points, reason, referenceID = null) {
        if (points <= 0) {
            return false;
        }

        const transaction = {
            transactionID: this.generateTransactionID(),
            type: 'earned',
            points: points,
            reason: reason,
            referenceID: referenceID,
            date: new Date(),
            balanceAfter: this.currentBalance + points
        };

        this.transactions.push(transaction);
        this.currentBalance += points;
        this.totalEarned += points;
        this.lastUpdated = new Date();

        return true;
    }

    /**
     * Deducts points from the user's account
     * @param {number} points - Points to deduct
     * @param {string} reason - Reason for spending points
     * @param {string} referenceID - Reference ID (orderID, etc.)
     * @returns {boolean} - True if points deducted successfully
     */
    deductPoints(points, reason, referenceID = null) {
        if (points <= 0 || points > this.currentBalance) {
            return false;
        }

        const transaction = {
            transactionID: this.generateTransactionID(),
            type: 'spent',
            points: points,
            reason: reason,
            referenceID: referenceID,
            date: new Date(),
            balanceAfter: this.currentBalance - points
        };

        this.transactions.push(transaction);
        this.currentBalance -= points;
        this.totalSpent += points;
        this.lastUpdated = new Date();

        return true;
    }

    /**
     * Reverses a transaction (for refunds, corrections)
     * @param {string} transactionID - Transaction ID to reverse
     * @param {string} reason - Reason for reversal
     * @returns {boolean} - True if reversal successful
     */
    reverseTransaction(transactionID, reason) {
        const originalTransaction = this.transactions.find(t => t.transactionID === transactionID);
        
        if (!originalTransaction) {
            return false;
        }

        const reversalTransaction = {
            transactionID: this.generateTransactionID(),
            type: originalTransaction.type === 'earned' ? 'deducted' : 'refunded',
            points: originalTransaction.points,
            reason: `Reversal: ${reason}`,
            referenceID: originalTransaction.referenceID,
            date: new Date(),
            originalTransactionID: transactionID
        };

        if (originalTransaction.type === 'earned') {
            // Reverse earned points (deduct them)
            if (this.currentBalance >= originalTransaction.points) {
                this.currentBalance -= originalTransaction.points;
                this.totalEarned -= originalTransaction.points;
                reversalTransaction.balanceAfter = this.currentBalance;
            } else {
                return false; // Not enough balance to reverse
            }
        } else {
            // Reverse spent points (refund them)
            this.currentBalance += originalTransaction.points;
            this.totalSpent -= originalTransaction.points;
            reversalTransaction.balanceAfter = this.currentBalance;
        }

        this.transactions.push(reversalTransaction);
        this.lastUpdated = new Date();

        return true;
    }

    /**
     * Calculates points earned from a purchase amount
     * @param {number} purchaseAmount - Purchase amount
     * @param {number} pointsRate - Points per dollar (default 1 point per dollar)
     * @returns {number} - Points to be earned
     */
    calculateEarnedPoints(purchaseAmount, pointsRate = 1) {
        return Math.floor(purchaseAmount * pointsRate);
    }

    /**
     * Calculates monetary value of points
     * @param {number} points - Points to convert
     * @param {number} conversionRate - Conversion rate (default 0.01, i.e., 100 points = $1)
     * @returns {number} - Monetary value
     */
    calculatePointsValue(points, conversionRate = 0.01) {
        return Math.round(points * conversionRate * 100) / 100;
    }

    /**
     * Gets transaction history with optional filtering
     * @param {string} type - Transaction type filter ('earned', 'spent', 'all')
     * @param {number} limit - Maximum number of transactions to return
     * @returns {Array} - Filtered transaction history
     */
    getTransactionHistory(type = 'all', limit = null) {
        let filteredTransactions = this.transactions;

        if (type !== 'all') {
            filteredTransactions = this.transactions.filter(t => t.type === type);
        }

        // Sort by date descending (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (limit) {
            filteredTransactions = filteredTransactions.slice(0, limit);
        }

        return filteredTransactions;
    }

    /**
     * Gets points summary for a specific period
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Object} - Points summary for the period
     */
    getPeriodSummary(startDate, endDate) {
        const periodTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        const earned = periodTransactions
            .filter(t => ['earned', 'refunded'].includes(t.type))
            .reduce((sum, t) => sum + t.points, 0);

        const spent = periodTransactions
            .filter(t => ['spent', 'deducted'].includes(t.type))
            .reduce((sum, t) => sum + t.points, 0);

        return {
            period: { start: startDate, end: endDate },
            pointsEarned: earned,
            pointsSpent: spent,
            netPoints: earned - spent,
            transactionCount: periodTransactions.length
        };
    }

    /**
     * Generates a unique transaction ID
     * @returns {string} - Transaction ID
     */
    generateTransactionID() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `PTS-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Validates points operation
     * @param {string} operation - Operation type ('add' or 'deduct')
     * @param {number} points - Points amount
     * @returns {Object} - Validation result
     */
    validateOperation(operation, points) {
        const errors = [];

        if (!points || points <= 0) {
            errors.push('Points amount must be greater than 0');
        }

        if (operation === 'deduct' && points > this.currentBalance) {
            errors.push('Insufficient points balance');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Gets ledger summary information
     * @returns {Object} - Ledger summary
     */
    getSummary() {
        return {
            ledgerID: this.ledgerID,
            userID: this.userID,
            currentBalance: this.currentBalance,
            totalEarned: this.totalEarned,
            totalSpent: this.totalSpent,
            transactionCount: this.transactions.length,
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Converts points ledger object to JSON for storage
     * @returns {Object} - Points ledger data as plain object
     */
    toJSON() {
        return {
            ledgerID: this.ledgerID,
            userID: this.userID,
            currentBalance: this.currentBalance,
            totalEarned: this.totalEarned,
            totalSpent: this.totalSpent,
            transactions: this.transactions,
            createdDate: this.createdDate,
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Creates PointsLedger instance from JSON data
     * @param {Object} data - Points ledger data from storage
     * @returns {PointsLedger} - New PointsLedger instance
     */
    static fromJSON(data) {
        const ledger = new PointsLedger(data.ledgerID, data.userID);
        
        ledger.currentBalance = data.currentBalance;
        ledger.totalEarned = data.totalEarned;
        ledger.totalSpent = data.totalSpent;
        ledger.transactions = data.transactions || [];
        ledger.createdDate = new Date(data.createdDate);
        ledger.lastUpdated = new Date(data.lastUpdated);
        
        return ledger;
    }
}

export default PointsLedger;
