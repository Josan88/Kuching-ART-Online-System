/**
 * OrderService Class - Handles order-related business logic
 * Manages order creation, processing, and management
 */
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import DataService from './DataService.js';

class OrderService {
    constructor() {
        this.dataService = new DataService();
    }

    /**
     * Creates a new order
     * @param {string} userID - User ID creating the order
     * @returns {Promise<Object>} - Creation result with order ID
     */
    async createOrder(userID) {
        try {
            const orderID = this.generateOrderID();
            const order = new Order(orderID, userID);
            
            // Save order
            const orders = await this.dataService.loadData('orders') || [];
            orders.push(order.toJSON());
            await this.dataService.saveData('orders', orders);

            return {
                success: true,
                message: 'Order created successfully',
                orderID: orderID
            };

        } catch (error) {
            console.error('Error creating order:', error);
            return {
                success: false,
                message: 'Failed to create order'
            };
        }
    }

    /**
     * Adds an item to an order
     * @param {string} orderID - Order ID
     * @param {Object} itemData - Item data to add
     * @returns {Promise<Object>} - Addition result
     */
    async addItemToOrder(orderID, itemData) {
        try {
            const order = await this.getOrderByID(orderID);
            if (!order) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }

            // Validate item availability
            const availabilityCheck = await this.checkItemAvailability(itemData);
            if (!availabilityCheck.available) {
                return {
                    success: false,
                    message: availabilityCheck.message
                };
            }

            // Create order item
            const orderItemID = this.generateOrderItemID();
            const orderItem = new OrderItem(
                orderItemID,
                orderID,
                itemData.itemType,
                itemData.itemID,
                itemData.quantity,
                itemData.unitPrice,
                itemData.itemName
            );

            // Validate order item
            const validation = orderItem.validate();
            if (!validation.isValid) {
                return {
                    success: false,
                    message: 'Invalid item data',
                    errors: validation.errors
                };
            }

            // Add item to order
            order.addItem(orderItem);

            // Update order in storage
            await this.updateOrderInStorage(order);

            return {
                success: true,
                message: 'Item added to order successfully',
                orderItem: orderItem.getSummary()
            };

        } catch (error) {
            console.error('Error adding item to order:', error);
            return {
                success: false,
                message: 'Failed to add item to order'
            };
        }
    }

    /**
     * Removes an item from an order
     * @param {string} orderID - Order ID
     * @param {string} orderItemID - Order item ID to remove
     * @returns {Promise<Object>} - Removal result
     */
    async removeItemFromOrder(orderID, orderItemID) {
        try {
            const order = await this.getOrderByID(orderID);
            if (!order) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }

            if (order.removeItem(orderItemID)) {
                await this.updateOrderInStorage(order);
                
                return {
                    success: true,
                    message: 'Item removed from order successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Item not found in order'
                };
            }

        } catch (error) {
            console.error('Error removing item from order:', error);
            return {
                success: false,
                message: 'Failed to remove item from order'
            };
        }
    }

    /**
     * Updates item quantity in an order
     * @param {string} orderID - Order ID
     * @param {string} orderItemID - Order item ID
     * @param {number} newQuantity - New quantity
     * @returns {Promise<Object>} - Update result
     */
    async updateItemQuantity(orderID, orderItemID, newQuantity) {
        try {
            const order = await this.getOrderByID(orderID);
            if (!order) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }

            if (order.updateItemQuantity(orderItemID, newQuantity)) {
                await this.updateOrderInStorage(order);
                
                return {
                    success: true,
                    message: 'Item quantity updated successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to update item quantity'
                };
            }

        } catch (error) {
            console.error('Error updating item quantity:', error);
            return {
                success: false,
                message: 'Failed to update item quantity'
            };
        }
    }

    /**
     * Applies a discount to an order
     * @param {string} orderID - Order ID
     * @param {number} discountAmount - Discount amount
     * @returns {Promise<Object>} - Application result
     */
    async applyDiscount(orderID, discountAmount) {
        try {
            const order = await this.getOrderByID(orderID);
            if (!order) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }

            order.applyDiscount(discountAmount);
            await this.updateOrderInStorage(order);

            return {
                success: true,
                message: 'Discount applied successfully',
                newTotal: order.totalAmount
            };

        } catch (error) {
            console.error('Error applying discount:', error);
            return {
                success: false,
                message: 'Failed to apply discount'
            };
        }
    }

    /**
     * Updates order status
     * @param {string} orderID - Order ID
     * @param {string} newStatus - New status
     * @returns {Promise<Object>} - Update result
     */
    async updateOrderStatus(orderID, newStatus) {
        try {
            const order = await this.getOrderByID(orderID);
            if (!order) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }

            if (order.updateStatus(newStatus)) {
                await this.updateOrderInStorage(order);
                
                return {
                    success: true,
                    message: 'Order status updated successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid status update'
                };
            }

        } catch (error) {
            console.error('Error updating order status:', error);
            return {
                success: false,
                message: 'Failed to update order status'
            };
        }
    }

    /**
     * Cancels an order
     * @param {string} orderID - Order ID
     * @returns {Promise<Object>} - Cancellation result
     */
    async cancelOrder(orderID) {
        try {
            const order = await this.getOrderByID(orderID);
            if (!order) {
                return {
                    success: false,
                    message: 'Order not found'
                };
            }

            if (order.cancel()) {
                await this.updateOrderInStorage(order);
                
                return {
                    success: true,
                    message: 'Order cancelled successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Order cannot be cancelled at this time'
                };
            }

        } catch (error) {
            console.error('Error cancelling order:', error);
            return {
                success: false,
                message: 'Failed to cancel order'
            };
        }
    }

    /**
     * Gets order by ID
     * @param {string} orderID - Order ID
     * @returns {Promise<Order|null>} - Order object or null
     */
    async getOrderByID(orderID) {
        try {
            const orders = await this.dataService.loadData('orders') || [];
            const orderData = orders.find(order => order.orderID === orderID);
            
            return orderData ? Order.fromJSON(orderData) : null;
        } catch (error) {
            console.error('Error getting order:', error);
            return null;
        }
    }

    /**
     * Gets orders by user ID
     * @param {string} userID - User ID
     * @returns {Promise<Array>} - Array of orders
     */
    async getOrdersByUserID(userID) {
        try {
            const orders = await this.dataService.loadData('orders') || [];
            const userOrders = orders
                .filter(order => order.userID === userID)
                .map(orderData => Order.fromJSON(orderData))
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            
            return userOrders;
        } catch (error) {
            console.error('Error getting user orders:', error);
            return [];
        }
    }

    /**
     * Gets all orders with optional filtering
     * @param {Object} filters - Filters to apply
     * @returns {Promise<Array>} - Array of filtered orders
     */
    async getAllOrders(filters = {}) {
        try {
            const orders = await this.dataService.loadData('orders') || [];
            let filteredOrders = orders.map(orderData => Order.fromJSON(orderData));

            // Apply filters
            if (filters.status) {
                filteredOrders = filteredOrders.filter(order => order.status === filters.status);
            }

            if (filters.startDate) {
                filteredOrders = filteredOrders.filter(order => 
                    order.orderDate >= new Date(filters.startDate)
                );
            }

            if (filters.endDate) {
                filteredOrders = filteredOrders.filter(order => 
                    order.orderDate <= new Date(filters.endDate)
                );
            }

            // Sort by date descending
            filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            
            return filteredOrders;
        } catch (error) {
            console.error('Error getting all orders:', error);
            return [];
        }
    }

    /**
     * Checks item availability
     * @param {Object} itemData - Item data to check
     * @returns {Promise<Object>} - Availability result
     */
    async checkItemAvailability(itemData) {
        try {
            if (itemData.itemType === 'ticket') {
                // Check ticket availability (simplified)
                return { available: true, message: 'Ticket available' };
            } else if (itemData.itemType === 'merchandise') {
                // Check merchandise stock
                const merchandise = await this.dataService.loadData('merchandise') || [];
                const item = merchandise.find(m => m.merchandiseID === itemData.itemID);
                
                if (!item) {
                    return { available: false, message: 'Merchandise not found' };
                }
                
                if (!item.isActive) {
                    return { available: false, message: 'Merchandise is not available' };
                }
                
                if (item.stockQuantity < itemData.quantity) {
                    return { available: false, message: 'Insufficient stock' };
                }
                
                return { available: true, message: 'Merchandise available' };
            }
            
            return { available: false, message: 'Unknown item type' };
        } catch (error) {
            console.error('Error checking item availability:', error);
            return { available: false, message: 'Error checking availability' };
        }
    }

    /**
     * Updates order in storage
     * @param {Order} order - Order to update
     * @returns {Promise<boolean>} - True if update successful
     */
    async updateOrderInStorage(order) {
        try {
            const orders = await this.dataService.loadData('orders') || [];
            const orderIndex = orders.findIndex(o => o.orderID === order.orderID);
            
            if (orderIndex !== -1) {
                orders[orderIndex] = order.toJSON();
                await this.dataService.saveData('orders', orders);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error updating order in storage:', error);
            return false;
        }
    }

    /**
     * Generates a unique order ID
     * @returns {string} - Unique order ID
     */
    generateOrderID() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `ORD-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Generates a unique order item ID
     * @returns {string} - Unique order item ID
     */
    generateOrderItemID() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6);
        return `ITM-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Gets order statistics
     * @param {Date} startDate - Start date for statistics
     * @param {Date} endDate - End date for statistics
     * @returns {Promise<Object>} - Order statistics
     */
    async getOrderStatistics(startDate, endDate) {
        try {
            const orders = await this.getAllOrders({
                startDate: startDate,
                endDate: endDate
            });

            const stats = {
                totalOrders: orders.length,
                totalRevenue: 0,
                averageOrderValue: 0,
                ordersByStatus: {},
                topItems: {}
            };

            orders.forEach(order => {
                stats.totalRevenue += order.totalAmount;
                
                // Count orders by status
                stats.ordersByStatus[order.status] = 
                    (stats.ordersByStatus[order.status] || 0) + 1;
                
                // Count items
                order.orderItems.forEach(item => {
                    const key = `${item.itemType}_${item.itemName}`;
                    stats.topItems[key] = (stats.topItems[key] || 0) + item.quantity;
                });
            });

            if (orders.length > 0) {
                stats.averageOrderValue = Math.round((stats.totalRevenue / orders.length) * 100) / 100;
            }

            return stats;
        } catch (error) {
            console.error('Error getting order statistics:', error);
            return {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                ordersByStatus: {},
                topItems: {}
            };
        }
    }
}

export default OrderService;
