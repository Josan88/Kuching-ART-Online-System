/**
 * Route Class - Represents a transportation route
 * Handles route information, scheduling, and availability
 */
class Route {
    constructor(routeID, routeName, startLocation, endLocation, distance, estimatedDuration, isActive = true) {
        this.routeID = routeID;
        this.routeName = routeName;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.distance = distance; // in kilometers
        this.estimatedDuration = estimatedDuration; // in minutes
        this.isActive = isActive;
        this.createdDate = new Date();
        this.lastUpdated = new Date();
    }

    /**
     * Updates route information
     * @param {Object} updateData - Data to update
     * @returns {boolean} - Success status
     */
    updateRoute(updateData) {
        try {
            if (updateData.routeName) this.routeName = updateData.routeName;
            if (updateData.startLocation) this.startLocation = updateData.startLocation;
            if (updateData.endLocation) this.endLocation = updateData.endLocation;
            if (updateData.distance) this.distance = updateData.distance;
            if (updateData.estimatedDuration) this.estimatedDuration = updateData.estimatedDuration;
            if (updateData.isActive !== undefined) this.isActive = updateData.isActive;
            
            this.lastUpdated = new Date();
            return true;
        } catch (error) {
            console.error('Error updating route:', error);
            return false;
        }
    }

    /**
     * Calculates estimated travel time based on current conditions
     * @param {Object} conditions - Current conditions (traffic, weather, etc.)
     * @returns {number} - Estimated duration in minutes
     */
    calculateEstimatedTime(conditions = {}) {
        let adjustedDuration = this.estimatedDuration;
        
        // Adjust for traffic conditions
        if (conditions.traffic === 'heavy') {
            adjustedDuration *= 1.5;
        } else if (conditions.traffic === 'light') {
            adjustedDuration *= 0.8;
        }
        
        // Adjust for weather conditions
        if (conditions.weather === 'bad') {
            adjustedDuration *= 1.3;
        }
        
        return Math.round(adjustedDuration);
    }

    /**
     * Validates route data
     * @returns {Object} - Validation result with isValid flag and errors array
     */
    validate() {
        const errors = [];
        
        if (!this.routeName || this.routeName.trim() === '') {
            errors.push('Route name is required');
        }
        
        if (!this.startLocation || this.startLocation.trim() === '') {
            errors.push('Start location is required');
        }
        
        if (!this.endLocation || this.endLocation.trim() === '') {
            errors.push('End location is required');
        }
        
        if (!this.distance || this.distance <= 0) {
            errors.push('Distance must be greater than 0');
        }
        
        if (!this.estimatedDuration || this.estimatedDuration <= 0) {
            errors.push('Estimated duration must be greater than 0');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Deactivates the route
     */
    deactivate() {
        this.isActive = false;
        this.lastUpdated = new Date();
    }

    /**
     * Activates the route
     */
    activate() {
        this.isActive = true;
        this.lastUpdated = new Date();
    }

    /**
     * Converts route object to JSON for storage
     * @returns {Object} - Route data as plain object
     */
    toJSON() {
        return {
            routeID: this.routeID,
            routeName: this.routeName,
            startLocation: this.startLocation,
            endLocation: this.endLocation,
            distance: this.distance,
            estimatedDuration: this.estimatedDuration,
            isActive: this.isActive,
            createdDate: this.createdDate,
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Creates Route instance from JSON data
     * @param {Object} data - Route data from storage
     * @returns {Route} - New Route instance
     */
    static fromJSON(data) {
        const route = new Route(
            data.routeID,
            data.routeName,
            data.startLocation,
            data.endLocation,
            data.distance,
            data.estimatedDuration,
            data.isActive
        );
        route.createdDate = new Date(data.createdDate);
        route.lastUpdated = new Date(data.lastUpdated);
        return route;
    }
}

export default Route;
