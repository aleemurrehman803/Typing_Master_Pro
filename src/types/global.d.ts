/**
 * Global Type Definitions for TypeMaster Pro
 * Phase 1: Foundational Languages (TypeScript)
 * 
 * This file begins the migration to strict typing by defining the 
 * core data structures used in the Typing Engine.
 */

/**
 * @typedef {Object} Keystroke
 * @property {string} char - The character typed.
 * @property {number} timestamp - The exact performance.now() timestamp.
 * @property {boolean} isCorrect - Whether the keystroke matched the target.
 */

/**
 * @typedef {Object} TypingStats
 * @property {number} wpm - Words Per Minute (standard calculation).
 * @property {number} accuracy - Percentage accuracy (0-100).
 * @property {number} errors - Total count of incorrect keystrokes.
 * @property {number} totalChars - Total characters typed.
 */

/**
 * @typedef {Object} IntegrityScore
 * @property {boolean} isBot - Flag indicating if bot behavior was detected.
 * @property {number} score - Integrity score (0-100).
 * @property {number} variance - Standard deviation of Inter-Key Intervals (IKI).
 * @property {number} bigramSuspect - Score indicating suspicious bigram timing.
 */

/**
 * @typedef {Object} WorkerMessage
 * @property {string} type - The type of message (e.g., 'STATS_UPDATE', 'INIT').
 * @property {Object} payload - The data payload for the message.
 */

export { };
