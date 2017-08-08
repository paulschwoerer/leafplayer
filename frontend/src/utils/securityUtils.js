/**
 * Validates a username i.e. user id.
 *
 * @param username
 */
export const validateUsername = username =>
    /^[A-Za-z0-9_-]{3,32}$/.test(username);

/**
 * Validates a password.
 *
 * @param password
 */
export const validatePassword = password =>
    password.length >= 8 && /.*[0-9]+.*/.test(password) && /.*[a-zA-Z].*/.test(password);
