import { getValue } from 'utils/injector';
import { ADAPTER } from 'data/Injectables';
import { CLEAR } from 'store/globalMutations';
import { serializeUrlParams } from 'utils/urlUtils';
import { ModelMutationTypes } from '../model';

export default {
    namespaced: true,

    state: {
        userFavorites: [],
    },

    actions: {
        /**
         * Load all favorite types. // TODO
         *
         * @param commit
         * @param offset
         * @param take
         * @param id
         */
        loadFavorites: ({ commit }, { offset, take }) =>
            getValue(ADAPTER).get(`favorites${serializeUrlParams({ offset, take })}`)
                .then(response => {

                }),
    },

    mutations: {
        [CLEAR]: (state) => {
            // TODO
        },
    },
};
