/**
 * Dynamically retrieves or generates a secure, device-specific key.
 * This key is stored in localStorage to prevent hardcoded client secrets.
 */
export const getDeviceKey = () => {
    const storageKey = 'tm_sys_dev_k';
    let localKey = null;
    try {
        if (typeof localStorage !== 'undefined') {
            localKey = localStorage.getItem(storageKey);
        }
    } catch {
        // Ignored
    }
    
    if (!localKey) {
        try {
            const array = new Uint8Array(32);
            if (typeof window !== 'undefined' && window.crypto) {
                window.crypto.getRandomValues(array);
            } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                crypto.getRandomValues(array);
            } else {
                for (let i = 0; i < 32; i++) {
                    array[i] = Math.floor(Math.random() * 256);
                }
            }
            localKey = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
        } catch {
            localKey = 'typemaster-storage-key-fallback-static';
        }
        
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(storageKey, localKey);
            }
        } catch {
            // Ignored
        }
    }
    return localKey;
};
