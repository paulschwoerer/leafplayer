export default {
    namespaced: true,

    state: {
        // is true when a component is currently dragged
        dragging: false,

        // holds the dnd monitor of the current drag
        monitor: null,
    },

    actions: {
        /**
         * Is called when the user starts to drag a component.
         *
         * @param commit
         * @param monitor
         */
        startDragging: ({ commit }, monitor) =>
            commit('START_DRAGGING', monitor),

        /**
         * Is called when the dragging process stops.
         *
         * @param commit
         */
        stopDragging: ({ commit }) =>
            commit('STOP_DRAGGING'),
    },

    mutations: {
        START_DRAGGING: (state, monitor) => {
            state.dragging = true;
            state.monitor = monitor;
        },

        STOP_DRAGGING: (state) => {
            state.dragging = false;
            state.monitor = null;
        },
    },
};
