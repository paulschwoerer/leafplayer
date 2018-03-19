/* global APP_BASE_URL */

import { ADAPTER } from '../../../data/Injectables';
import { getValue } from '../../../utils/injector';

const CHECK_DEMO = 'CHECK_DEMO';
export const SET_SETUP = 'SET_SETUP';

export default {
    namespaced: true,

    state: {
        api: {
            base: `${APP_BASE_URL}api/`,
        },
        isDemo: false,
        needsSetup: false,
    },

    actions: {
        checkDemo: ({ commit }) =>
            getValue(ADAPTER).get('is-demo')
                .then(({ data }) => {
                    commit(CHECK_DEMO, data.result);
                })
                .catch(() => {
                    console.warn('Cannot get demo state');
                    commit(CHECK_DEMO, false);
                }),
        checkSetup: ({ commit }) =>
            getValue(ADAPTER).get('setup/needs-setup')
                .then(({ data }) => {
                    commit(SET_SETUP, data.result);
                })
                .catch(() => {
                    console.warn('Cannot get setup state');
                    commit(SET_SETUP, false);
                }),
    },

    mutations: {
        [CHECK_DEMO]: (state, payload) => {
            state.isDemo = payload;
        },

        [SET_SETUP]: (state, payload) => {
            state.needsSetup = payload;
        },
    },

    getters: {

    },
};
