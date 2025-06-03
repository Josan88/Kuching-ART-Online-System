/**
 * Order Class - Represents a customer order
 * Handles order creation, management, and calculation of totals
 */
import OrderItem from './OrderItem.js';

class Order {
    constructor(orderID, userID, orderDate = new Date()) {
        this.orderID = orderID;
        this.userID = userID;
        this.orderDate = orderDate;
        this.status = 'pending'; // 'pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'
        this.orderItems = [];
        this.subtotal = 0;
        this.taxAmount = 0;
        this.discountAmount = 0;
        this.totalAmount = 0;
        this.paymentStatus = 'unpaid'; // 'unpaid', 'paid', 'failed', 'refunded'
        this.shippingAddress = null;
        this.notes = '';
        this.lastUpdated = new Date();
    }

    /**
     * Adds an item to the order
     * @param {OrderItem} orderItem - Order item to add
     * @returns {boolean} - True if item added successfully
     */
    addItem(orderItem) {
        try {
            // Check if item already exists in order
            const existingItem = this.orderItems.find(item => 
                item.itemType === orderItem.itemType && item.itemID === orderItem.itemID
            );

            if (existingItem) {
                // Update quantity of existing item
                existingItem.updateQuantity(existingItem.quantity + orderItem.quantity);
            } else {
                // Add new item
                this.orderItems.push(orderItem);
            }

            this.calculateTotals();
            this.lastUpdated = new Date();
            return true;
        } catch (error) {
            console.error('Error adding item to order:', error);
            return false;
        }
    }

    /**
     * Removes an item from the order
     * @param {string} orderItemID - Order item ID to remove
     * @returns {boolean} - True if item removed successfully
     */
    removeItem(orderItemID) {
        const initialLength = this.orderItems.length;
        this.orderItems = this.orderItems.filter(item => item.orderItemID !== orderItemID);
        
        if (this.orderItems.length < initialLength) {
            this.calculateTotals();
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Updates quantity of an existing item
     * @param {string} orderItemID - Order item ID to update
     * @param {number} newQuantity - New quantity
     * @returns {boolean} - True if update successful
     */
    updateItemQuantity(orderItemID, newQuantity) {
        const item = this.orderItems.find(item => item.orderItemID === orderItemID);
        
        if (item && item.updateQuantity(newQuantity)) {
            this.calculateTotals();
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Calculates all totals for the order
     */
    calculateTotals() {
        this.subtotal = this.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        this.taxAmount = Math.round(this.subtotal * 0.06 * 100) / 100; // 6% tax
        this.totalAmount = Math.round((this.subtotal + this.taxAmount - this.discountAmount) * 100) / 100;
    }

    /**
     * Applies a discount to the order
     * @param {number} discountAmount - Discount amount to apply
     */
    applyDiscount(discountAmount) {
        if (discountAmount >= 0 && discountAmount <= this.subtotal) {
            this.discountAmount = discountAmount;
            this.calculateTotals();
            this.lastUpdated = new Date();
        }
    }

    /**
     * Updates order status
     * @param {string} newStatus - New status
     * @returns {boolean} - True if status updated successfully
     */
    updateStatus(newStatus) {
        const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'];
        
        if (validStatuses.includes(newStatus)) {
            this.status = newStatus;
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Updates payment status
     * @param {string} newPaymentStatus - New payment status
     * @returns {boolean} - True if payment status updated successfully
     */
    updatePaymentStatus(newPaymentStatus) {
        const validPaymentStatuses = ['unpaid', 'paid', 'failed', 'refunded'];
        
        if (validPaymentStatuses.includes(newPaymentStatus)) {
            this.paymentStatus = newPaymentStatus;
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Sets shipping address for the order
     * @param {Object} address - Shipping address object
     */
    setShippingAddress(address) {
        this.shippingAddress = {
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country
        };
        this.lastUpdated = new Date();
    }

    /**
     * Cancels the order
     * @returns {boolean} - True if cancellation successful
     */
    cancel() {
        if (['pending', 'confirmed'].includes(this.status)) {
            this.status = 'cancelled';
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Validates the order
     * @returns {Object} - Validation result with isValid flag and errors array
     */
    validate() {
        const errors = [];
        
        if (this.orderItems.length === 0) {
            errors.push('Order must contain at least one item');
        }
        
        // Validate each order item
        this.orderItems.forEach((item, index) => {
            const itemValidation = item.validate();
            if (!itemValidation.isValid) {
                errors.push(`Item ${index + 1}: ${itemValidation.errors.join(', ')}`);
            }
        });
        
        if (this.totalAmount <= 0) {
            errors.push('Order total must be greater than 0');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Gets order summary information
     * @returns {Object} - Order summary
     */
    getSummary() {
        return {
            orderID: this.orderID,
            orderDate: this.orderDate,
            status: this.status,
            paymentStatus: this.paymentStatus,
            itemCount: this.orderItems.length,
            subtotal: this.subtotal,
            taxAmount: this.taxAmount,
            discountAmount: this.discountAmount,
            totalAmount: this.totalAmount
        };
    }

    /**
     * Converts order object to JSON for storage
     * @returns {Object} - Order data as plain object
     */
    toJSON() {
        return {
            orderID: this.orderID,
            userID: this.userID,
            orderDate: this.orderDate,
            status: this.status,
            orderItems: this.orderItems.map(item => item.toJSON()),
            subtotal: this.subtotal,
            taxAmount: this.taxAmount,
            discountAmount: this.discountAmount,
            totalAmount: this.totalAmount,
            paymentStatus: this.paymentStatus,
            shippingAddress: this.shippingAddress,
            notes: this.notes,
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Creates Order instance from JSON data
     * @param {Object} data - Order data from storage
     * @returns {Order} - New Order instance
     */
    static fromJSON(data) {
        const order = new Order(
            data.orderID,
            data.userID,
            new Date(data.orderDate)
        );
        
        order.status = data.status;
        order.orderItems = data.orderItems.map(itemData => OrderItem.fromJSON(itemData));
        order.subtotal = data.subtotal;
        order.taxAmount = data.taxAmount;
        order.discountAmount = data.discountAmount;
        order.totalAmount = data.totalAmount;
        order.paymentStatus = data.paymentStatus;
        order.shippingAddress = data.shippingAddress;
        order.notes = data.notes;
        order.lastUpdated = new Date(data.lastUpdated);
        
        return order;
    }
}

export default Order;
