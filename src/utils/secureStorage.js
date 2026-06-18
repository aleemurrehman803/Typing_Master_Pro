import { encryptData, decryptData } from './crypto';

/**
 * Secure Storage Wrapper
 * Encrypted localStorage with error handling and type safety
 */

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'typemaster-storage-key';
const STORAGE_PREFIX = 'tm_'; // TypeMaster prefix

class SecureStorage {
    /**
     * Set item in encrypted storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    setItem(key, value) {
        try {
            const prefixedKey = STORAGE_PREFIX + key;
            const encrypted = encryptData(value, ENCRYPTION_KEY);
            localStorage.setItem(prefixedKey, encrypted);
            return true;
        } catch (error) {
            console.error(`Storage error for key "${key}":`, error);

            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded. Clearing old data...');
                this.cleanup();

                // Try one more time
                try {
                    const prefixedKey = STORAGE_PREFIX + key;
                    const encrypted = encryptData(value, ENCRYPTION_KEY);
                    localStorage.setItem(prefixedKey, encrypted);
                    return true;
                } catch (retryError) {
                    console.error('Storage failed after cleanup:', retryError);
                    return false;
                }
            }

            return false;
        }
    }

    /**
     * Get item from encrypted storage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Decrypted value
     */
    getItem(key, defaultValue = null) {
        try {
            const prefixedKey = STORAGE_PREFIX + key;
            const encrypted = localStorage.getItem(prefixedKey);

            if (!encrypted) {
                return defaultValue;
            }

            const decrypted = decryptData(encrypted, ENCRYPTION_KEY);
            return decrypted !== null ? decrypted : defaultValue;
        } catch (error) {
            console.error(`Storage retrieval error for key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeItem(key) {
        try {
            const prefixedKey = STORAGE_PREFIX + key;
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (error) {
            console.error(`Storage removal error for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Clear all TypeMaster storage
     * @returns {boolean} Success status
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * Check if key exists
     * @param {string} key - Storage key
     * @returns {boolean}
     */
    hasItem(key) {
        const prefixedKey = STORAGE_PREFIX + key;
        return localStorage.getItem(prefixedKey) !== null;
    }

    /**
     * Get all TypeMaster keys
     * @returns {string[]} Array of keys (without prefix)
     */
    getAllKeys() {
        const keys = Object.keys(localStorage);
        return keys
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .map(key => key.substring(STORAGE_PREFIX.length));
    }

    /**
     * Get storage size in bytes
     * @returns {number} Size in bytes
     */
    getSize() {
        let size = 0;
        const keys = Object.keys(localStorage);

        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                const value = localStorage.getItem(key);
                size += key.length + (value?.length || 0);
            }
        });

        return size;
    }

    /**
     * Get storage size in KB
     * @returns {number} Size in KB
     */
    getSizeKB() {
        return Math.round(this.getSize() / 1024 * 100) / 100;
    }

    /**
     * Cleanup old or large items
     * @param {number} maxAge - Max age in days (default: 30)
     */
    cleanup(maxAge = 30) {
        try {
            const keys = this.getAllKeys();
            const now = Date.now();
            const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;

            keys.forEach(key => {
                // Skip critical keys
                if (['user', 'token', 'users'].includes(key)) {
                    return;
                }

                const data = this.getItem(key);

                // Remove if expired
                if (data && data.timestamp && (now - data.timestamp) > maxAgeMs) {
                    this.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Export all data (for backup)
     * @returns {object} All storage data
     */
    exportData() {
        const data = {};
        const keys = this.getAllKeys();

        keys.forEach(key => {
            data[key] = this.getItem(key);
        });

        return data;
    }

    /**
     * Import data (from backup)
     * @param {object} data - Data to import
     * @param {boolean} merge - Merge with existing data
     * @returns {boolean} Success status
     */
    importData(data, merge = false) {
        try {
            if (!merge) {
                this.clear();
            }

            Object.entries(data).forEach(([key, value]) => {
                this.setItem(key, value);
            });

            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Export class for testing
export { SecureStorage };
