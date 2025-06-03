/**
 * DataService Class - Handles data persistence operations
 * Uses localStorage for data storage
 */
class DataService {
    constructor() {
        this.storagePrefix = 'kart_'; // Prefix for storage keys
    }

    /**
     * Saves data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     * @returns {Promise<boolean>} - True if save successful
     */
    async saveData(key, data) {
        try {
            const storageKey = this.storagePrefix + key;
            localStorage.setItem(storageKey, JSON.stringify(data));
            return true;        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    /**
     * Loads data from localStorage
     * @param {string} key - Storage key
     * @returns {Promise<any>} - Loaded data or null
     */
    async loadData(key) {
        try {
            const storageKey = this.storagePrefix + key;
            const localData = localStorage.getItem(storageKey);
            return localData ? JSON.parse(localData) : null;        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    /**
     * Deletes data from localStorage
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} - True if delete successful
     */
    async deleteData(key) {
        try {
            const storageKey = this.storagePrefix + key;
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            return false;
        }
    }

    /**
     * Checks if data exists in storage
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} - True if data exists
     */
    async exists(key) {
        try {
            const data = await this.loadData(key);
            return data !== null;        } catch (error) {
            console.error('Error checking data existence:', error);
            return false;
        }
    }

    /**
     * Gets all keys with the storage prefix from localStorage
     * @returns {Promise<Array>} - Array of keys
     */
    async getAllKeys() {
        try {
            let keys = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    keys.push(key.substring(this.storagePrefix.length));
                }
            }
            
            return keys;
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    /**
     * Clears all data with the storage prefix
     * @returns {Promise<boolean>} - True if clear successful
     */
    async clearAll() {
        try {
            const keys = await this.getAllKeys();
            
            for (const key of keys) {
                await this.deleteData(key);
            }
            
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    /**
     * Exports all data to JSON
     * @returns {Promise<Object>} - All data as JSON object
     */
    async exportData() {
        try {
            const keys = await this.getAllKeys();
            const exportData = {};
            
            for (const key of keys) {
                exportData[key] = await this.loadData(key);
            }
            
            return {
                timestamp: new Date().toISOString(),
                data: exportData
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    /**
     * Imports data from JSON
     * @param {Object} importData - Data to import
     * @returns {Promise<boolean>} - True if import successful
     */
    async importData(importData) {
        try {
            if (!importData.data) {
                throw new Error('Invalid import data format');
            }
            
            for (const [key, value] of Object.entries(importData.data)) {
                await this.saveData(key, value);
            }
            
            return true;        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Gets localStorage usage information
     * @returns {Object} - Storage usage stats
     */
    getStorageInfo() {
        try {
            let used = 0;
            
            // Estimate localStorage usage
            for (let key in localStorage) {
                if (key.startsWith(this.storagePrefix)) {
                    used += localStorage[key].length;
                }
            }
            
            const total = 5 * 1024 * 1024; // Typical 5MB limit
            
            return {
                used: used,
                total: total,
                percentage: total > 0 ? Math.round((used / total) * 100) : 0,
                type: 'localStorage'
            };
        } catch (error) {
            console.error('Error getting storage info:', error);            return { used: 0, total: 0, percentage: 0, type: 'localStorage' };
        }
    }
}

export default DataService;
