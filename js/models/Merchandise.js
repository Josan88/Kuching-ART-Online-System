/**
 * Merchandise Class - Represents merchandise items for sale
 * Handles product information, inventory, and pricing
 */
class Merchandise {
    constructor(merchandiseID, name, description, price, category, stockQuantity, imageURL = null) {
        this.merchandiseID = merchandiseID;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category; // e.g., 'clothing', 'accessories', 'souvenirs', 'food'
        this.stockQuantity = stockQuantity;
        this.imageURL = imageURL;
        this.isActive = true;
        this.dateAdded = new Date();
        this.lastUpdated = new Date();
        this.salesCount = 0;
        this.averageRating = 0;
        this.reviewCount = 0;
    }

    /**
     * Updates merchandise information
     * @param {Object} updateData - Data to update
     * @returns {boolean} - Success status
     */
    updateMerchandise(updateData) {
        try {
            if (updateData.name) this.name = updateData.name;
            if (updateData.description) this.description = updateData.description;
            if (updateData.price !== undefined) this.price = updateData.price;
            if (updateData.category) this.category = updateData.category;
            if (updateData.stockQuantity !== undefined) this.stockQuantity = updateData.stockQuantity;
            if (updateData.imageURL) this.imageURL = updateData.imageURL;
            if (updateData.isActive !== undefined) this.isActive = updateData.isActive;
            
            this.lastUpdated = new Date();
            return true;
        } catch (error) {
            console.error('Error updating merchandise:', error);
            return false;
        }
    }

    /**
     * Checks if item is available for purchase
     * @param {number} quantity - Requested quantity
     * @returns {boolean} - True if available
     */
    isAvailable(quantity = 1) {
        return this.isActive && this.stockQuantity >= quantity;
    }

    /**
     * Reduces stock quantity after purchase
     * @param {number} quantity - Quantity sold
     * @returns {boolean} - True if stock reduction successful
     */
    reduceStock(quantity) {
        if (this.isAvailable(quantity)) {
            this.stockQuantity -= quantity;
            this.salesCount += quantity;
            this.lastUpdated = new Date();
            return true;
        }
        return false;
    }

    /**
     * Increases stock quantity (restocking)
     * @param {number} quantity - Quantity to add
     */
    addStock(quantity) {
        if (quantity > 0) {
            this.stockQuantity += quantity;
            this.lastUpdated = new Date();
        }
    }

    /**
     * Adds a rating to the merchandise
     * @param {number} rating - Rating value (1-5)
     */
    addRating(rating) {
        if (rating >= 1 && rating <= 5) {
            const totalRating = this.averageRating * this.reviewCount + rating;
            this.reviewCount++;
            this.averageRating = Math.round((totalRating / this.reviewCount) * 100) / 100;
        }
    }

    /**
     * Calculates discount price
     * @param {number} discountPercentage - Discount percentage (0-100)
     * @returns {number} - Discounted price
     */
    getDiscountedPrice(discountPercentage) {
        if (discountPercentage > 0 && discountPercentage <= 100) {
            return Math.round((this.price * (1 - discountPercentage / 100)) * 100) / 100;
        }
        return this.price;
    }

    /**
     * Gets stock status
     * @returns {string} - Stock status description
     */
    getStockStatus() {
        if (this.stockQuantity === 0) {
            return 'Out of Stock';
        } else if (this.stockQuantity <= 5) {
            return 'Low Stock';
        } else if (this.stockQuantity <= 20) {
            return 'Limited Stock';
        } else {
            return 'In Stock';
        }
    }

    /**
     * Validates merchandise data
     * @returns {Object} - Validation result with isValid flag and errors array
     */
    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim() === '') {
            errors.push('Merchandise name is required');
        }
        
        if (!this.description || this.description.trim() === '') {
            errors.push('Description is required');
        }
        
        if (!this.price || this.price <= 0) {
            errors.push('Price must be greater than 0');
        }
        
        if (!this.category || this.category.trim() === '') {
            errors.push('Category is required');
        }
        
        if (this.stockQuantity < 0) {
            errors.push('Stock quantity cannot be negative');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Deactivates the merchandise
     */
    deactivate() {
        this.isActive = false;
        this.lastUpdated = new Date();
    }

    /**
     * Activates the merchandise
     */
    activate() {
        this.isActive = true;
        this.lastUpdated = new Date();
    }

    /**
     * Converts merchandise object to JSON for storage
     * @returns {Object} - Merchandise data as plain object
     */
    toJSON() {
        return {
            merchandiseID: this.merchandiseID,
            name: this.name,
            description: this.description,
            price: this.price,
            category: this.category,
            stockQuantity: this.stockQuantity,
            imageURL: this.imageURL,
            isActive: this.isActive,
            dateAdded: this.dateAdded,
            lastUpdated: this.lastUpdated,
            salesCount: this.salesCount,
            averageRating: this.averageRating,
            reviewCount: this.reviewCount
        };
    }

    /**
     * Creates Merchandise instance from JSON data
     * @param {Object} data - Merchandise data from storage
     * @returns {Merchandise} - New Merchandise instance
     */
    static fromJSON(data) {
        const merchandise = new Merchandise(
            data.merchandiseID,
            data.name,
            data.description,
            data.price,
            data.category,
            data.stockQuantity,
            data.imageURL
        );
        merchandise.isActive = data.isActive;
        merchandise.dateAdded = new Date(data.dateAdded);
        merchandise.lastUpdated = new Date(data.lastUpdated);
        merchandise.salesCount = data.salesCount || 0;
        merchandise.averageRating = data.averageRating || 0;
        merchandise.reviewCount = data.reviewCount || 0;
        return merchandise;
    }
}

export default Merchandise;
