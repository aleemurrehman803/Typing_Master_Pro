/**
 * Professional Input Validation Utilities
 * Comprehensive validation for all user inputs
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateEmail = (email) => {
    const errors = [];

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
        return { valid: false, errors };
    }

    const trimmed = email.trim();

    // RFC 5322 compliant email regex
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (trimmed.length === 0) {
        errors.push('Email is required');
    } else if (trimmed.length > 254) {
        errors.push('Email is too long (max 254 characters)');
    } else if (!regex.test(trimmed)) {
        errors.push('Please enter a valid email address');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate password with strength calculation
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, errors: string[], strength: number, strengthLabel: string}}
 */
export const validatePassword = (password) => {
    const errors = [];

    if (!password) {
        return {
            valid: false,
            errors: ['Password is required'],
            strength: 0,
            strengthLabel: 'None'
        };
    }

    // Length requirements
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (password.length > 128) {
        errors.push('Password is too long (max 128 characters)');
    }

    // Character requirements
    if (!/[A-Z]/.test(password)) {
        errors.push('Must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Must contain at least one special character');
    }

    // Calculate strength (0-100)
    let strength = 0;

    // Length scoring
    if (password.length >= 8) strength += 15;
    if (password.length >= 10) strength += 10;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Character variety
    if (/[A-Z]/.test(password)) strength += 13;
    if (/[a-z]/.test(password)) strength += 13;
    if (/[0-9]/.test(password)) strength += 13;
    if (/[!@#$%^&*]/.test(password)) strength += 13;

    // Complexity bonuses
    const uniqueChars = new Set(password).size;
    if (uniqueChars > 8) strength += 5;
    if (uniqueChars > 12) strength += 5;

    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) strength -= 10; // Repeated characters
    if (/^[a-zA-Z]+$/.test(password)) strength -= 10; // Only letters
    if (/^[0-9]+$/.test(password)) strength -= 15; // Only numbers
    if (/^(password|123456|qwerty|admin)/i.test(password)) strength -= 30; // Common passwords

    strength = Math.max(0, Math.min(100, strength));

    // Determine label
    let strengthLabel = 'Weak';
    if (strength >= 80) strengthLabel = 'Very Strong';
    else if (strength >= 60) strengthLabel = 'Strong';
    else if (strength >= 40) strengthLabel = 'Medium';
    else if (strength >= 20) strengthLabel = 'Fair';

    return {
        valid: errors.length === 0,
        errors,
        strength,
        strengthLabel
    };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateName = (name) => {
    const errors = [];

    if (!name || typeof name !== 'string') {
        errors.push('Name is required');
        return { valid: false, errors };
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
        errors.push('Name is required');
    } else if (trimmed.length < 2) {
        errors.push('Name must be at least 2 characters');
    } else if (trimmed.length > 50) {
        errors.push('Name is too long (max 50 characters)');
    } else if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateUrl = (url) => {
    const errors = [];

    if (!url) {
        errors.push('URL is required');
        return { valid: false, errors };
    }

    try {
        new URL(url);
    } catch {
        errors.push('Please enter a valid URL');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate phone number (international format)
 * @param {string} phone - Phone number to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validatePhone = (phone) => {
    const errors = [];

    if (!phone) {
        errors.push('Phone number is required');
        return { valid: false, errors };
    }

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    if (digits.length < 10 || digits.length > 15) {
        errors.push('Please enter a valid phone number');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Check if passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    const errors = [];

    if (!confirmPassword) {
        errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate typing test duration
 * @param {number} duration - Duration in seconds
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateTestDuration = (duration) => {
    const errors = [];
    const validDurations = [30, 60, 120, 180, 300];

    if (!validDurations.includes(duration)) {
        errors.push('Invalid test duration');
    }

    return { valid: errors.length === 0, errors };
};
