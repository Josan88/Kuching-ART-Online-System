/**
 * DataService Class - Handles data persistence operations
 * Provides abstraction layer for data storage (localStorage/files/database)
 */
class DataService {
    constructor(storageType = 'localStorage') {
        this.storageType = storageType; // 'localStorage', 'sessionStorage', 'indexedDB'
        this.storagePrefix = 'kart_'; // Prefix for storage keys
    }

    /**
     * Saves data to storage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     * @returns {Promise<boolean>} - True if save successful
     */
    async saveData(key, data) {
        try {
            const storageKey = this.storagePrefix + key;
            
            switch (this.storageType) {
                case 'localStorage':
                    localStorage.setItem(storageKey, JSON.stringify(data));
                    break;
                case 'sessionStorage':
                    sessionStorage.setItem(storageKey, JSON.stringify(data));
                    break;
                case 'indexedDB':
                    await this.saveToIndexedDB(storageKey, data);
                    break;
                default:
                    throw new Error('Unsupported storage type');
            }
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    /**
     * Loads data from storage
     * @param {string} key - Storage key
     * @returns {Promise<any>} - Loaded data or null
     */
    async loadData(key) {
        try {
            const storageKey = this.storagePrefix + key;
            let data = null;
            
            switch (this.storageType) {
                case 'localStorage':
                    const localData = localStorage.getItem(storageKey);
                    data = localData ? JSON.parse(localData) : null;
                    break;
                case 'sessionStorage':
                    const sessionData = sessionStorage.getItem(storageKey);
                    data = sessionData ? JSON.parse(sessionData) : null;
                    break;
                case 'indexedDB':
                    data = await this.loadFromIndexedDB(storageKey);
                    break;
                default:
                    throw new Error('Unsupported storage type');
            }
            
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    /**
     * Deletes data from storage
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} - True if delete successful
     */
    async deleteData(key) {
        try {
            const storageKey = this.storagePrefix + key;
            
            switch (this.storageType) {
                case 'localStorage':
                    localStorage.removeItem(storageKey);
                    break;
                case 'sessionStorage':
                    sessionStorage.removeItem(storageKey);
                    break;
                case 'indexedDB':
                    await this.deleteFromIndexedDB(storageKey);
                    break;
                default:
                    throw new Error('Unsupported storage type');
            }
            
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
            return data !== null;
        } catch (error) {
            console.error('Error checking data existence:', error);
            return false;
        }
    }

    /**
     * Gets all keys with the storage prefix
     * @returns {Promise<Array>} - Array of keys
     */
    async getAllKeys() {
        try {
            let keys = [];
            
            switch (this.storageType) {
                case 'localStorage':
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith(this.storagePrefix)) {
                            keys.push(key.substring(this.storagePrefix.length));
                        }
                    }
                    break;
                case 'sessionStorage':
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        if (key && key.startsWith(this.storagePrefix)) {
                            keys.push(key.substring(this.storagePrefix.length));
                        }
                    }
                    break;
                case 'indexedDB':
                    keys = await this.getAllKeysFromIndexedDB();
                    break;
                default:
                    throw new Error('Unsupported storage type');
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
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Gets storage usage information
     * @returns {Object} - Storage usage stats
     */
    getStorageInfo() {
        try {
            let used = 0;
            let total = 0;
            
            switch (this.storageType) {
                case 'localStorage':
                    // Estimate localStorage usage
                    for (let key in localStorage) {
                        if (key.startsWith(this.storagePrefix)) {
                            used += localStorage[key].length;
                        }
                    }
                    total = 5 * 1024 * 1024; // Typical 5MB limit
                    break;
                case 'sessionStorage':
                    // Estimate sessionStorage usage
                    for (let key in sessionStorage) {
                        if (key.startsWith(this.storagePrefix)) {
                            used += sessionStorage[key].length;
                        }
                    }
                    total = 5 * 1024 * 1024; // Typical 5MB limit
                    break;
                case 'indexedDB':
                    // IndexedDB usage would require navigator.storage.estimate()
                    used = 0;
                    total = 0;
                    break;
            }
            
            return {
                used: used,
                total: total,
                percentage: total > 0 ? Math.round((used / total) * 100) : 0,
                type: this.storageType
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return { used: 0, total: 0, percentage: 0, type: this.storageType };
        }
    }

    /**
     * Saves data to IndexedDB
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     * @returns {Promise<void>}
     */
    async saveToIndexedDB(key, data) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('KuchingART', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['data'], 'readwrite');
                const store = transaction.objectStore('data');
                
                const putRequest = store.put({ key: key, value: data });
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                const store = db.createObjectStore('data', { keyPath: 'key' });
            };
        });
    }

    /**
     * Loads data from IndexedDB
     * @param {string} key - Storage key
     * @returns {Promise<any>} - Loaded data
     */
    async loadFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('KuchingART', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['data'], 'readonly');
                const store = transaction.objectStore('data');
                
                const getRequest = store.get(key);
                getRequest.onsuccess = () => {
                    const result = getRequest.result;
                    resolve(result ? result.value : null);
                };
                getRequest.onerror = () => reject(getRequest.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                const store = db.createObjectStore('data', { keyPath: 'key' });
            };
        });
    }

    /**
     * Deletes data from IndexedDB
     * @param {string} key - Storage key
     * @returns {Promise<void>}
     */
    async deleteFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('KuchingART', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['data'], 'readwrite');
                const store = transaction.objectStore('data');
                
                const deleteRequest = store.delete(key);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
            };
        });
    }

    /**
     * Gets all keys from IndexedDB
     * @returns {Promise<Array>} - Array of keys
     */
    async getAllKeysFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('KuchingART', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['data'], 'readonly');
                const store = transaction.objectStore('data');
                
                const getAllRequest = store.getAllKeys();
                getAllRequest.onsuccess = () => {
                    const keys = getAllRequest.result
                        .filter(key => key.startsWith(this.storagePrefix))
                        .map(key => key.substring(this.storagePrefix.length));
                    resolve(keys);
                };
                getAllRequest.onerror = () => reject(getAllRequest.error);
            };
        });
    }
}

export default DataService;
