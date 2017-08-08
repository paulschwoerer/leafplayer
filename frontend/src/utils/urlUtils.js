/**
 * Serialize given url parameters as "?key1=value1&key2=value2" and so on.
 *
 * @param params
 * @returns {string}
 */
export function serializeUrlParams(params) {
    const keys = Object.keys(params)
        .filter(key => typeof params[key] !== 'undefined');

    if (keys.length) {
        return `?${keys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&')}`;
    }

    return '';
}
