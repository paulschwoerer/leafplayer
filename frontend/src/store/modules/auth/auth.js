import { getValue } from 'utils/injector';
import { ADAPTER } from 'data/Injectables';
import { CLEAR } from 'store/globalMutations';
import { ModelMutationTypes } from '../model';

export const SET_USER = 'SET_USER';
export const STORE_TOKEN = 'STORE_TOKEN';
export const SET_TO_READY = 'SET_TO_READY';

export default {
    namespaced: true,

    state: {
        userId: null,
        ready: false,
        token: localStorage.getItem('leafplayer-jwt-token'),
    },

    actions: {
        /**
         * Fetch the authenticated user from the backend.
         *
         * @param commit
         */
        fetchUser: ({ commit }) =>
            getValue(ADAPTER).get('auth/user')
                .then(({ data, included }) => {
                    commit(ModelMutationTypes.ADD_MODEL, { data, included }, { root: true });
                    commit(SET_USER, data.id);
                    commit(SET_TO_READY);
                })
                .catch(() => commit(SET_TO_READY)),
    },

    mutations: {
        [SET_USER]: (state, payload) => {
            state.userId = payload;
        },

        [SET_TO_READY]: (state) => {
            state.ready = true;
        },

        [STORE_TOKEN]: (state, payload) => {
            localStorage.setItem('leafplayer-jwt-token', payload);
            state.token = payload;
        },

        [CLEAR]: (state) => {
            localStorage.removeItem('leafplayer-jwt-token');
            state.token = null;
            state.userId = null;
        },
    },
};
