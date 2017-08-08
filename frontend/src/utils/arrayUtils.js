/**
 * Helper to sort an array of objects by a given string property. Case insensitive.
 *
 * @param property
 */
export const sortByPropertyCI = property => (a, b) => {
    const propA = a[property].toLowerCase();
    const propB = b[property].toLowerCase();

    return (propA < propB) ? -1 : (propA > propB) ? 1 : 0;
};

/**
 * Helper to sort an array by a given property.
 *
 * @param property
 */
export const sortByProperty = property => (a, b) =>
    ((a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0);
