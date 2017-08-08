const values = {};

export const setValue = (key, value) => {
    values[key] = value;
};

export const getValue = (key) => {
    if (process.env.NODE_ENV !== 'production') {
        if (!(key in values)) {
            throw new ReferenceError(`[Injector] Injectable "${key}" has never been configured`);
        }
    }

    return values[key];
};
