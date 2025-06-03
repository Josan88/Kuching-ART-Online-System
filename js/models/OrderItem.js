/**
 * OrderItem Class - Represents an item within an order
 * Links orders with tickets or merchandise and handles quantities
 */
class OrderItem {
    constructor(orderItemID, orderID, itemType, itemID, quantity, unitPrice, itemName) {
        this.orderItemID = orderItemID;
        this.orderID = orderID;
        this.itemType = itemType; // 'ticket' or 'merchandise'
        this.itemID = itemID; // ticketID or merchandiseID
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.itemName = itemName;
        this.subtotal = this.calculateSubtotal();
        this.dateAdded = new Date();
    }

    /**
     * Calculates subtotal for this order item
     * @returns {number} - Subtotal amount
     */
    calculateSubtotal() {
        return Math.round((this.quantity * this.unitPrice) * 100) / 100;
    }

    /**
     * Updates the quantity and recalculates subtotal
     * @param {number} newQuantity - New quantity
     * @returns {boolean} - True if update successful
     */
    updateQuantity(newQuantity) {
        if (newQuantity > 0) {
            this.quantity = newQuantity;
            this.subtotal = this.calculateSubtotal();
            return true;
        }
        return false;
    }

    /**
     * Updates the unit price and recalculates subtotal
     * @param {number} newPrice - New unit price
     * @returns {boolean} - True if update successful
     */
    updatePrice(newPrice) {
        if (newPrice > 0) {
            this.unitPrice = newPrice;
            this.subtotal = this.calculateSubtotal();
            return true;
        }
        return false;
    }

    /**
     * Validates order item data
     * @returns {Object} - Validation result with isValid flag and errors array
     */
    validate() {
        const errors = [];
        
        if (!this.itemType || !['ticket', 'merchandise'].includes(this.itemType)) {
            errors.push('Item type must be either "ticket" or "merchandise"');
        }
        
        if (!this.itemID) {
            errors.push('Item ID is required');
        }
        
        if (!this.quantity || this.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        }
        
        if (!this.unitPrice || this.unitPrice <= 0) {
            errors.push('Unit price must be greater than 0');
        }
        
        if (!this.itemName || this.itemName.trim() === '') {
            errors.push('Item name is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Gets item summary information
     * @returns {Object} - Item summary
     */
    getSummary() {
        return {
            orderItemID: this.orderItemID,
            itemType: this.itemType,
            itemName: this.itemName,
            quantity: this.quantity,
            unitPrice: this.unitPrice,
            subtotal: this.subtotal
        };
    }

    /**
     * Converts order item object to JSON for storage
     * @returns {Object} - Order item data as plain object
     */
    toJSON() {
        return {
            orderItemID: this.orderItemID,
            orderID: this.orderID,
            itemType: this.itemType,
            itemID: this.itemID,
            quantity: this.quantity,
            unitPrice: this.unitPrice,
            itemName: this.itemName,
            subtotal: this.subtotal,
            dateAdded: this.dateAdded
        };
    }

    /**
     * Creates OrderItem instance from JSON data
     * @param {Object} data - Order item data from storage
     * @returns {OrderItem} - New OrderItem instance
     */
    static fromJSON(data) {
        const orderItem = new OrderItem(
            data.orderItemID,
            data.orderID,
            data.itemType,
            data.itemID,
            data.quantity,
            data.unitPrice,
            data.itemName
        );
        orderItem.subtotal = data.subtotal;
        orderItem.dateAdded = new Date(data.dateAdded);
        return orderItem;
    }
}

export default OrderItem;
