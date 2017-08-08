import { getValue } from 'utils/injector';
import { ADAPTER } from 'data/Injectables';
import { serializeUrlParams } from 'utils/urlUtils';
import { setToInitialState } from 'utils/storeUtils';
import { CLEAR } from 'store/globalMutations';

import { ModelMutationTypes } from '../model';

export const SET_QUERY = 'SET_QUERY';
export const RESET_SEARCH = 'RESET_SEARCH';
export const PERFORM_SEARCH = 'PERFORM_SEARCH';
export const SET_SEARCH_TO_BUSY = 'SET_SEARCH_TO_BUSY';
export const SET_SEARCH_TO_NOT_BUSY = 'SET_SEARCH_TO_NOT_BUSY';

const emptyResults = () => ({
    artists: [],

    albums: [],

    songs: [],
});

const initialState = () => ({
    searchQuery: '',

    searchResults: emptyResults(),

    searchBusy: false,
});

export default {
    namespaced: true,

    state: initialState(),

    actions: {
        /**
         * Perform a search against the API. If an empty query string is passed the search results will be cleared.
         *
         * @param commit
         * @param query
         * @param cancelToken
         */
        performSearch: ({ commit }, { query, cancelToken }) => {
            if (query.length > 0) {
                commit(SET_SEARCH_TO_BUSY);

                return getValue(ADAPTER).post(`collection/search${serializeUrlParams({
                    search: query,
                })}`, { cancelToken }).then((response) => {
                    if (response) {
                        const { data, included } = response;

                        commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, { data: data.artists }, { root: true });
                        commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, { data: data.albums }, { root: true });
                        commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, { data: data.songs }, { root: true });
                        commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, { data: included }, { root: true });

                        commit(PERFORM_SEARCH, data);
                        commit(SET_SEARCH_TO_NOT_BUSY);
                    }
                });
            }

            return Promise.resolve()
                .then(() => commit(RESET_SEARCH));
        },

        setQuery: ({ commit }, { query }) =>
            commit(SET_QUERY, query),
    },

    mutations: {
        [PERFORM_SEARCH]: (state, { artists, albums, songs }) => {
            state.searchResults.artists = artists.map(artist => artist.id);
            state.searchResults.albums = albums.map(album => album.id);
            state.searchResults.songs = songs.map(song => song.id);
        },

        [RESET_SEARCH]: (state) => {
            state.searchResults = emptyResults();
        },

        [SET_QUERY]: (state, payload) => {
            state.searchQuery = payload;
        },

        [SET_SEARCH_TO_BUSY]: (state) => {
            state.searchBusy = true;
        },

        [SET_SEARCH_TO_NOT_BUSY]: (state) => {
            state.searchBusy = false;
        },

        [CLEAR]: (state) => {
            setToInitialState(state, initialState());
        },
    },

    getters: {
        numberOfSearchResults: (state) => {
            let count = 0;

            Object.keys(state.searchResults).forEach((key) => {
                count += state.searchResults[key].length;
            });

            return count;
        },
    },
};
