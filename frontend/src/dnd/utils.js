/**
 * Pick some object values from a defined set of object keys.
 *
 * @param obj
 * @param keys
 * @returns {{}}
 */
export const pick = (obj, keys) => {
    const result = {};

    keys.forEach((key) => {
        if (obj[key] !== 'undefined') {
            result[key] = obj[key];
        }
    });

    return result;
};

/**
 * Get all values from object while omitting the given keys.
 *
 * @param obj
 * @param keys
 * @returns {{}}
 */
export const omit = (obj, keys) => {
    const result = {};

    Object.keys(obj).forEach((key) => {
        if (keys.indexOf(key) === -1) {
            result[key] = obj[key];
        }
    });

    return result;
};

/**
 * Get options from a Vue component.
 *
 * @param Component
 */
export const getOptions = Component =>
    (typeof Component === 'function' ? Component.options : Component);

/**
 * Get props from Vue component.
 *
 * @param Component
 * @param propKeys
 * @param ignorePropKeys
 */
export const getComponentProps = (Component, propKeys, ignorePropKeys) =>
    omit(getOptions(Component).props || {}, propKeys.concat(ignorePropKeys));

/**
 * Get name of component.
 *
 * @param Component
 */
export const getComponentName = Component =>
    getOptions(Component).name || 'anonymous-component';

/**
 * Get the base component of a wrapper component.
 *
 * @param wrapperComponent
 * @returns {*}
 */
export const getBaseComponent = (wrapperComponent) => {
    let base = wrapperComponent;

    while (base.isWrapperComponent === true) {
        base = base.$children[0];
    }

    return base;
};

/**
 * Assert method used to check correctness of values in the dnd module.
 *
 * @param condition
 * @param message
 */
export const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
};
