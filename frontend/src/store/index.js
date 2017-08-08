import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';
import { CLEAR, TOGGLE_SIDE_BAR } from './globalMutations';

Vue.use(Vuex);

const store = new Vuex.Store({
    strict: process.env.NODE_ENV === 'development',

    modules,

    state: {
        sideBarVisible: false,
    },

    actions: {
        /**
         * Call the CLEAR mutation on every module it exists on, thus clearing the store of any relevant data.
         * This action should be called by the authentication handler, when the user is logging out.
         *
         * That way, every module can handle clearing its data individually.
         *
         * @param commit
         */
        clearStore: ({ commit }) => Object.keys(modules).forEach((key) => {
            if (modules[key].mutations && modules[key].mutations[CLEAR]) {
                commit(`${key}/${CLEAR}`);
            }
        }),

        /**
         * Toggle visibility of sidebar.
         *
         * @param commit
         */
        toggleSideBar: ({ commit }) => commit(TOGGLE_SIDE_BAR),
    },

    mutations: {
        [TOGGLE_SIDE_BAR]: (state) => {
            state.sideBarVisible = !state.sideBarVisible;
        },
    },
});

export default store;
