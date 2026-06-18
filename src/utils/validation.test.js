import { describe, it, expect } from 'vitest';
import {
    validateEmail,
    validatePassword,
    validateName,
    sanitizeInput,
    validatePasswordMatch
} from './validation';

describe('Validation Utils', () => {
    describe('validateEmail', () => {
        it('should validate correct email addresses', () => {
            expect(validateEmail('test@example.com').valid).toBe(true);
            expect(validateEmail('user.name@domain.co.uk').valid).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(validateEmail('invalid-email').valid).toBe(false);
            expect(validateEmail('@domain.com').valid).toBe(false);
            expect(validateEmail('user@').valid).toBe(false);
            expect(validateEmail('').valid).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should validate strong passwords', () => {
            const result = validatePassword('StrongP@ss1');
            expect(result.valid).toBe(true);
            expect(result.strength).toBeGreaterThan(50);
        });

        it('should reject weak passwords', () => {
            expect(validatePassword('weak').valid).toBe(false);
            expect(validatePassword('12345678').valid).toBe(false); // No special chars/letters mixed
        });

        it('should calculate strength correctly', () => {
            const weak = validatePassword('password');
            const strong = validatePassword('MySup3rP@ssw0rd!');
            expect(strong.strength).toBeGreaterThan(weak.strength);
        });
    });

    describe('validateName', () => {
        it('should validate correct names', () => {
            expect(validateName('John Doe').valid).toBe(true);
            expect(validateName('O\'Connor').valid).toBe(true);
        });

        it('should reject invalid names', () => {
            expect(validateName('J').valid).toBe(false); // Too short
            expect(validateName('User123').valid).toBe(false); // Numbers not allowed
        });
    });

    describe('sanitizeInput', () => {
        it('should escape HTML characters', () => {
            const malicious = '<script>alert("xss")</script>';
            const sanitized = sanitizeInput(malicious);
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('&lt;script&gt;');
        });
    });

    describe('validatePasswordMatch', () => {
        it('should return valid if passwords match', () => {
            expect(validatePasswordMatch('password123', 'password123').valid).toBe(true);
        });

        it('should return invalid if passwords do not match', () => {
            expect(validatePasswordMatch('password123', 'password456').valid).toBe(false);
        });
    });
});
