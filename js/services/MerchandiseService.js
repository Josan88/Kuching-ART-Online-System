/**
 * MerchandiseService - Service class for managing merchandise operations
 * Handles product catalog, inventory, and sales management
 * 
 * @author Jason
 * @version 1.0
 * @since Assignment 3 - SWE30003
 */

class MerchandiseService {
    constructor(dataService) {
        this.dataService = dataService;
        this.categories = ['apparel', 'accessories', 'souvenirs', 'collectibles', 'books', 'electronics'];
        this.lowStockThreshold = 10;
    }

    /**
     * Get all merchandise with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Object} Merchandise list with pagination
     */
    async getAllMerchandise(options = {}) {
        try {
            let merchandise = await this.dataService.getAll('merchandise');

            // Apply filters
            if (options.category) {
                merchandise = merchandise.filter(item => item.category === options.category);
            }

            if (options.minPrice !== undefined) {
                merchandise = merchandise.filter(item => item.price >= options.minPrice);
            }

            if (options.maxPrice !== undefined) {
                merchandise = merchandise.filter(item => item.price <= options.maxPrice);
            }

            if (options.inStock) {
                merchandise = merchandise.filter(item => item.stockQuantity > 0);
            }

            if (options.featured) {
                merchandise = merchandise.filter(item => item.featured === true);
            }

            if (options.search) {
                const searchTerm = options.search.toLowerCase();
                merchandise = merchandise.filter(item => 
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm) ||
                    item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            }

            // Apply sorting
            if (options.sortBy) {
                merchandise = this.sortMerchandise(merchandise, options.sortBy, options.sortOrder);
            }

            // Apply pagination
            const page = options.page || 1;
            const limit = options.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            return {
                merchandise: merchandise.slice(startIndex, endIndex),
                totalCount: merchandise.length,
                currentPage: page,
                totalPages: Math.ceil(merchandise.length / limit),
                categories: this.categories,
                filters: {
                    category: options.category,
                    minPrice: options.minPrice,
                    maxPrice: options.maxPrice,
                    inStock: options.inStock,
                    featured: options.featured,
                    search: options.search
                }
            };

        } catch (error) {
            console.error('Error fetching merchandise:', error);
            return {
                merchandise: [],
                totalCount: 0,
                currentPage: 1,
                totalPages: 0,
                categories: this.categories
            };
        }
    }

    /**
     * Sort merchandise array
     * @param {Array} merchandise - Merchandise array
     * @param {string} sortBy - Sort field
     * @param {string} sortOrder - Sort order (asc/desc)
     * @returns {Array} Sorted merchandise
     */
    sortMerchandise(merchandise, sortBy, sortOrder = 'asc') {
        return merchandise.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle different data types
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (typeof aValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (typeof aValue === 'string') {
                if (sortOrder === 'asc') {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            }

            if (aValue instanceof Date) {
                return sortOrder === 'asc' ? 
                    new Date(aValue) - new Date(bValue) : 
                    new Date(bValue) - new Date(aValue);
            }

            return 0;
        });
    }

    /**
     * Get merchandise by ID
     * @param {string} merchandiseId - Merchandise ID
     * @returns {Object|null} Merchandise item
     */
    async getMerchandiseById(merchandiseId) {
        try {
            const merchandise = await this.dataService.getById('merchandise', merchandiseId);
            
            if (merchandise) {
                // Add related merchandise suggestions
                merchandise.relatedItems = await this.getRelatedMerchandise(merchandise);
                
                // Add availability status
                merchandise.availabilityStatus = this.getAvailabilityStatus(merchandise);
            }

            return merchandise;

        } catch (error) {
            console.error('Error fetching merchandise by ID:', error);
            return null;
        }
    }

    /**
     * Get related merchandise based on category and tags
     * @param {Object} merchandise - Reference merchandise
     * @param {number} limit - Number of related items to return
     * @returns {Array} Related merchandise
     */
    async getRelatedMerchandise(merchandise, limit = 4) {
        try {
            const allMerchandise = await this.dataService.getAll('merchandise');
            
            // Filter out the current item and get items with matching category or tags
            let related = allMerchandise.filter(item => 
                item.id !== merchandise.id &&
                (item.category === merchandise.category ||
                 item.tags.some(tag => merchandise.tags.includes(tag)))
            );

            // Sort by relevance (same category first, then by tag matches)
            related.sort((a, b) => {
                const aScore = this.calculateRelevanceScore(a, merchandise);
                const bScore = this.calculateRelevanceScore(b, merchandise);
                return bScore - aScore;
            });

            return related.slice(0, limit);

        } catch (error) {
            console.error('Error fetching related merchandise:', error);
            return [];
        }
    }

    /**
     * Calculate relevance score for related items
     * @param {Object} item - Item to score
     * @param {Object} reference - Reference item
     * @returns {number} Relevance score
     */
    calculateRelevanceScore(item, reference) {
        let score = 0;

        // Same category gets higher score
        if (item.category === reference.category) {
            score += 10;
        }

        // Matching tags
        const matchingTags = item.tags.filter(tag => reference.tags.includes(tag));
        score += matchingTags.length * 2;

        // Similar price range
        const priceDiff = Math.abs(item.price - reference.price);
        const priceRange = reference.price * 0.5; // 50% price range
        if (priceDiff <= priceRange) {
            score += 3;
        }

        return score;
    }

    /**
     * Get availability status for merchandise
     * @param {Object} merchandise - Merchandise item
     * @returns {Object} Availability status
     */
    getAvailabilityStatus(merchandise) {
        if (merchandise.stockQuantity <= 0) {
            return {
                status: 'out_of_stock',
                message: 'Out of Stock',
                canOrder: false
            };
        } else if (merchandise.stockQuantity <= this.lowStockThreshold) {
            return {
                status: 'low_stock',
                message: `Only ${merchandise.stockQuantity} left in stock`,
                canOrder: true
            };
        } else {
            return {
                status: 'in_stock',
                message: 'In Stock',
                canOrder: true
            };
        }
    }

    /**
     * Check stock availability for multiple items
     * @param {Array} items - Array of {merchandiseId, quantity}
     * @returns {Object} Stock check result
     */
    async checkStockAvailability(items) {
        try {
            const results = [];
            let allAvailable = true;

            for (const item of items) {
                const merchandise = await this.dataService.getById('merchandise', item.merchandiseId);
                
                if (!merchandise) {
                    results.push({
                        merchandiseId: item.merchandiseId,
                        requested: item.quantity,
                        available: 0,
                        isAvailable: false,
                        message: 'Product not found'
                    });
                    allAvailable = false;
                    continue;
                }

                const isAvailable = merchandise.stockQuantity >= item.quantity;
                
                results.push({
                    merchandiseId: item.merchandiseId,
                    name: merchandise.name,
                    requested: item.quantity,
                    available: merchandise.stockQuantity,
                    isAvailable: isAvailable,
                    message: isAvailable ? 'Available' : 'Insufficient stock'
                });

                if (!isAvailable) {
                    allAvailable = false;
                }
            }

            return {
                allAvailable: allAvailable,
                items: results
            };

        } catch (error) {
            console.error('Error checking stock availability:', error);
            return {
                allAvailable: false,
                items: [],
                error: error.message
            };
        }
    }

    /**
     * Reserve stock for order processing
     * @param {Array} items - Array of {merchandiseId, quantity}
     * @param {string} reservationId - Unique reservation ID
     * @returns {Object} Reservation result
     */
    async reserveStock(items, reservationId) {
        try {
            // First check availability
            const availability = await this.checkStockAvailability(items);
            
            if (!availability.allAvailable) {
                return {
                    success: false,
                    message: 'Some items are not available in requested quantities',
                    availability: availability
                };
            }

            // Reserve stock by reducing available quantity
            const reservations = [];
            
            for (const item of items) {
                const merchandise = await this.dataService.getById('merchandise', item.merchandiseId);
                
                // Update stock quantity
                merchandise.stockQuantity -= item.quantity;
                merchandise.reservedQuantity = (merchandise.reservedQuantity || 0) + item.quantity;
                
                // Add reservation record
                if (!merchandise.reservations) {
                    merchandise.reservations = [];
                }
                
                merchandise.reservations.push({
                    reservationId: reservationId,
                    quantity: item.quantity,
                    reservedAt: new Date(),
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
                });

                await this.dataService.update('merchandise', item.merchandiseId, merchandise);
                
                reservations.push({
                    merchandiseId: item.merchandiseId,
                    quantity: item.quantity,
                    reservedAt: new Date()
                });
            }

            return {
                success: true,
                reservationId: reservationId,
                reservations: reservations,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            };

        } catch (error) {
            console.error('Error reserving stock:', error);
            return {
                success: false,
                message: 'Failed to reserve stock',
                error: error.message
            };
        }
    }

    /**
     * Release stock reservation
     * @param {string} reservationId - Reservation ID to release
     * @returns {Object} Release result
     */
    async releaseStockReservation(reservationId) {
        try {
            const allMerchandise = await this.dataService.getAll('merchandise');
            let releasedItems = [];

            for (const merchandise of allMerchandise) {
                if (merchandise.reservations) {
                    const reservation = merchandise.reservations.find(r => r.reservationId === reservationId);
                    
                    if (reservation) {
                        // Restore stock quantity
                        merchandise.stockQuantity += reservation.quantity;
                        merchandise.reservedQuantity -= reservation.quantity;
                        
                        // Remove reservation
                        merchandise.reservations = merchandise.reservations.filter(r => r.reservationId !== reservationId);
                        
                        await this.dataService.update('merchandise', merchandise.id, merchandise);
                        
                        releasedItems.push({
                            merchandiseId: merchandise.id,
                            quantity: reservation.quantity
                        });
                    }
                }
            }

            return {
                success: true,
                releasedItems: releasedItems,
                message: 'Stock reservation released successfully'
            };

        } catch (error) {
            console.error('Error releasing stock reservation:', error);
            return {
                success: false,
                message: 'Failed to release stock reservation',
                error: error.message
            };
        }
    }

    /**
     * Confirm stock reservation (convert to sale)
     * @param {string} reservationId - Reservation ID to confirm
     * @returns {Object} Confirmation result
     */
    async confirmStockReservation(reservationId) {
        try {
            const allMerchandise = await this.dataService.getAll('merchandise');
            let confirmedItems = [];

            for (const merchandise of allMerchandise) {
                if (merchandise.reservations) {
                    const reservation = merchandise.reservations.find(r => r.reservationId === reservationId);
                    
                    if (reservation) {
                        // Update sold quantity and remove reservation
                        merchandise.soldQuantity = (merchandise.soldQuantity || 0) + reservation.quantity;
                        merchandise.reservedQuantity -= reservation.quantity;
                        
                        // Remove reservation
                        merchandise.reservations = merchandise.reservations.filter(r => r.reservationId !== reservationId);
                        
                        await this.dataService.update('merchandise', merchandise.id, merchandise);
                        
                        confirmedItems.push({
                            merchandiseId: merchandise.id,
                            quantity: reservation.quantity
                        });
                    }
                }
            }

            return {
                success: true,
                confirmedItems: confirmedItems,
                message: 'Stock reservation confirmed successfully'
            };

        } catch (error) {
            console.error('Error confirming stock reservation:', error);
            return {
                success: false,
                message: 'Failed to confirm stock reservation',
                error: error.message
            };
        }
    }

    /**
     * Get low stock items
     * @param {number} threshold - Stock threshold (optional)
     * @returns {Array} Low stock items
     */
    async getLowStockItems(threshold = null) {
        try {
            const stockThreshold = threshold || this.lowStockThreshold;
            const allMerchandise = await this.dataService.getAll('merchandise');
            
            const lowStockItems = allMerchandise.filter(item => 
                item.stockQuantity <= stockThreshold && item.stockQuantity > 0
            );

            // Sort by stock level (lowest first)
            lowStockItems.sort((a, b) => a.stockQuantity - b.stockQuantity);

            return lowStockItems;

        } catch (error) {
            console.error('Error fetching low stock items:', error);
            return [];
        }
    }

    /**
     * Get merchandise sales statistics
     * @param {Object} options - Filter options
     * @returns {Object} Sales statistics
     */
    async getSalesStatistics(options = {}) {
        try {
            const allMerchandise = await this.dataService.getAll('merchandise');
            
            // Apply date filters if needed (would require order data)
            let merchandise = allMerchandise;

            // Calculate statistics
            const totalProducts = merchandise.length;
            const totalStock = merchandise.reduce((sum, item) => sum + item.stockQuantity, 0);
            const totalSold = merchandise.reduce((sum, item) => sum + (item.soldQuantity || 0), 0);
            const totalValue = merchandise.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0);
            const totalSalesValue = merchandise.reduce((sum, item) => sum + (item.price * (item.soldQuantity || 0)), 0);

            // Category breakdown
            const categoryStats = {};
            this.categories.forEach(category => {
                const categoryItems = merchandise.filter(item => item.category === category);
                categoryStats[category] = {
                    count: categoryItems.length,
                    totalStock: categoryItems.reduce((sum, item) => sum + item.stockQuantity, 0),
                    totalSold: categoryItems.reduce((sum, item) => sum + (item.soldQuantity || 0), 0),
                    totalValue: categoryItems.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0)
                };
            });

            // Top selling items
            const topSelling = merchandise
                .filter(item => item.soldQuantity > 0)
                .sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0))
                .slice(0, 10);

            // Low stock items
            const lowStock = merchandise.filter(item => 
                item.stockQuantity <= this.lowStockThreshold && item.stockQuantity > 0
            );

            // Out of stock items
            const outOfStock = merchandise.filter(item => item.stockQuantity === 0);

            return {
                totalProducts,
                totalStock,
                totalSold,
                totalValue,
                totalSalesValue,
                categoryStats,
                topSelling,
                lowStock: lowStock.length,
                outOfStock: outOfStock.length,
                averagePrice: totalProducts > 0 ? totalValue / totalStock : 0
            };

        } catch (error) {
            console.error('Error calculating sales statistics:', error);
            return null;
        }
    }

    /**
     * Search merchandise with advanced filters
     * @param {string} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Array} Search results
     */
    async searchMerchandise(query, filters = {}) {
        try {
            const allMerchandise = await this.dataService.getAll('merchandise');
            const searchTerm = query.toLowerCase();            let results = allMerchandise.filter(item => {
                // Text search
                const textMatch = 
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm) ||
                    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                    item.category.toLowerCase().includes(searchTerm);

                if (!textMatch) return false;

                // Apply filters
                if (filters.category && item.category !== filters.category) return false;
                if (filters.minPrice !== undefined && item.price < filters.minPrice) return false;
                if (filters.maxPrice !== undefined && item.price > filters.maxPrice) return false;
                if (filters.inStock && item.stockQuantity <= 0) return false;

                return true;
            });

            // Calculate relevance scores and sort
            results = results.map(item => ({
                ...item,
                relevanceScore: this.calculateSearchRelevance(item, searchTerm)
            }));

            results.sort((a, b) => b.relevanceScore - a.relevanceScore);

            return results;

        } catch (error) {
            console.error('Error searching merchandise:', error);
            return [];
        }
    }

    /**
     * Calculate search relevance score
     * @param {Object} item - Merchandise item
     * @param {string} searchTerm - Search term
     * @returns {number} Relevance score
     */
    calculateSearchRelevance(item, searchTerm) {
        let score = 0;

        // Exact name match gets highest score
        if (item.name.toLowerCase() === searchTerm) {
            score += 100;
        } else if (item.name.toLowerCase().includes(searchTerm)) {
            score += 50;
        }

        // Description match
        if (item.description.toLowerCase().includes(searchTerm)) {
            score += 20;
        }

        // Tag matches
        const matchingTags = item.tags.filter(tag => 
            tag.toLowerCase().includes(searchTerm)
        );
        score += matchingTags.length * 10;

        // Category match
        if (item.category.toLowerCase().includes(searchTerm)) {
            score += 15;
        }

        // Boost for featured items
        if (item.featured) {
            score += 5;
        }

        // Boost for in-stock items
        if (item.stockQuantity > 0) {
            score += 3;
        }

        return score;
    }

    /**
     * Clean up expired reservations
     * @returns {Object} Cleanup result
     */
    async cleanupExpiredReservations() {
        try {
            const allMerchandise = await this.dataService.getAll('merchandise');
            let cleanedCount = 0;
            const now = new Date();

            for (const merchandise of allMerchandise) {
                if (merchandise.reservations && merchandise.reservations.length > 0) {
                    const expiredReservations = merchandise.reservations.filter(r => 
                        new Date(r.expiresAt) <= now
                    );

                    if (expiredReservations.length > 0) {
                        // Restore stock for expired reservations
                        let releasedQuantity = 0;
                        expiredReservations.forEach(reservation => {
                            releasedQuantity += reservation.quantity;
                        });

                        merchandise.stockQuantity += releasedQuantity;
                        merchandise.reservedQuantity -= releasedQuantity;

                        // Remove expired reservations
                        merchandise.reservations = merchandise.reservations.filter(r => 
                            new Date(r.expiresAt) > now
                        );

                        await this.dataService.update('merchandise', merchandise.id, merchandise);
                        cleanedCount += expiredReservations.length;
                    }
                }
            }

            return {
                success: true,
                cleanedReservations: cleanedCount,
                message: `Cleaned up ${cleanedCount} expired reservations`
            };

        } catch (error) {
            console.error('Error cleaning up expired reservations:', error);
            return {
                success: false,
                message: 'Failed to cleanup expired reservations',
                error: error.message
            };
        }
    }
}

export default MerchandiseService;
