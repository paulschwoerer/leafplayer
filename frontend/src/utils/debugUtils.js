/**
 * Simple assert function for debugging.
 *
 * @param condition
 * @param message
 */
/* eslint-disable import/prefer-default-export */
export const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
};
/* eslint-enable import/prefer-default-export */
