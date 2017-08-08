/**
 * Set a given module's state to a given initial state.
 *
 * @param state
 * @param initialState
 */
export const setToInitialState = (state, initialState) => {
    Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
    });
};
