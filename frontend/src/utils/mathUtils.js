/**
 * Returns true if the value is in between lower (inclusive) and upper (exclusive) border
 * Useful for array index validations.
 *
 * @param value
 * @param lower
 * @param upper
 */
export const isBetween = (value, lower, upper) =>
    value < upper && value >= lower;

/**
 * Clamp value to min if it is smaller than min or clamp it to max if it is bigger.
 * Return the value if it is in between.
 *
 * @param value
 * @param min
 * @param max
 */
export const clamp = (value, min, max) =>
    Math.max(min, Math.min(value, max));

/**
 * Return a random integer between min (inclusive) and max (inclusive)
 *
 * @param min
 * @param max
 */
export const getRandomInt = (min, max) =>
    Math.floor(Math.random() * ((max - min) + 1)) + min;

/**
 * Return a random float between min (inclusive) and max (exclusive)
 *
 * @param min
 * @param max
 */
export const getRandomFloat = (min, max) =>
    (Math.random() * (max - min)) + min;
