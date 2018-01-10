import { getValue } from 'utils/injector';
import { ADAPTER } from 'data/Injectables';
import ModelType from 'data/enum/ModelType';
import { CLEAR } from 'store/globalMutations';
import { serializeUrlParams } from 'utils/urlUtils';
import { setToInitialState } from 'utils/storeUtils';
import { showFailNotification } from 'utils/notificationUtils';

import { AuthNamespace } from '../auth';
import { ModelMutationTypes, ModelNamespace } from '../model';

const LOAD_ALBUMS = 'LOAD_ALBUMS';
const LOAD_ARTISTS = 'LOAD_ARTISTS';
const LOAD_PLAYLISTS = 'LOAD_PLAYLISTS';
const CREATE_PLAYLIST = 'CREATE_PLAYLIST';
const DELETE_PLAYLIST = 'DELETE_PLAYLIST';
const LOAD_STATISTICS = 'LOAD_STATISTICS';
const LOAD_POPULAR_SONGS = 'LOAD_POPULAR_SONGS';
const LOAD_USER_PLAYLISTS = 'LOAD_USER_PLAYLISTS';
const LOAD_SUGGESTED_ALBUMS = 'LOAD_SUGGESTED_ALBUMS';

// Initial state of the module
const initialState = () => ({
    statistics: null,

    artistOffset: 0,
    totalArtists: NaN,

    albumOffset: 0,
    totalAlbums: NaN,

    playlistOffset: 0,
    totalPlaylists: NaN,

    userPlaylistOffset: 0,
    totalUserPlaylists: NaN,

    suggestedAlbumIds: [],
    popularSongIds: [],
});

export default {
    namespaced: true,

    state: initialState(),

    actions: {
        /**
         * Load collection statistics from backend.
         *
         * @param commit
         */
        loadStatistics: ({ commit }) =>
            getValue(ADAPTER).get('collection/statistics')
                .then(response => commit(LOAD_STATISTICS, response)),

        loadSuggestedAlbums: ({ commit }) =>
            getValue(ADAPTER).get('suggested/albums').then((response) => {
                commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, response, { root: true });

                commit(LOAD_SUGGESTED_ALBUMS, response);
            }),

        loadPopularSongs: ({ commit }) =>
            getValue(ADAPTER).get('popular/songs').then((response) => {
                commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, response, { root: true });

                commit(LOAD_POPULAR_SONGS, response);
            }),

        /**
         * Load user playlists.
         *
         * @param commit
         * @param rootState
         * @param offset
         * @param take
         */
        loadUserPlaylists: ({ commit, rootState }, { offset, take }) =>
            /* eslint-disable max-len */
            getValue(ADAPTER).get(`user/${rootState[AuthNamespace].userId}/playlists${serializeUrlParams({ offset, take })}`)
                .then((response) => {
                    // Add models to model store
                    commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, {
                        data: response.data.items,
                    }, { root: true });

                    // Update pagination
                    commit(LOAD_USER_PLAYLISTS, response);

                    // return the response data
                    return response.data;
                }),

        /**
         * Load artists.
         *
         * @param commit
         * @param offset
         * @param take
         */
        loadArtists: ({ commit }, { offset, take }) =>
            getValue(ADAPTER).get(`artist${serializeUrlParams({ offset, take })}`)
                .then((response) => {
                    // Add models to model store
                    commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, {
                        data: response.data.items,
                    }, { root: true });

                    // Update pagination
                    commit(LOAD_ARTISTS, response);

                    // return the response data
                    return response.data;
                }),

        /**
         * Load albums.
         *
         * @param commit
         * @param offset
         * @param take
         */
        loadAlbums: ({ commit }, { offset, take }) =>
            getValue(ADAPTER).get(`album${serializeUrlParams({ offset, take })}`)
                .then((response) => {
                    // Add models to model store
                    commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, {
                        data: response.data.items,
                    }, { root: true });

                    // Update pagination
                    commit(LOAD_ALBUMS, response);

                    // return the response data
                    return response.data;
                }),

        /**
         * Load albums.
         *
         * @param commit
         * @param offset
         * @param take
         */
        loadPlaylists: ({ commit }, { offset, take }) =>
            getValue(ADAPTER).get(`playlist${serializeUrlParams({ offset, take })}`)
                .then((response) => {
                    // Add models to model store
                    commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, {
                        data: response.data.items,
                    }, { root: true });

                    // Update pagination
                    commit(LOAD_PLAYLISTS, response);

                    // return the response data
                    return response.data;
                }),

        /**
         * Load an album.
         *
         * @param commit
         * @param id
         */
        loadAlbum: ({ commit }, id) =>
            getValue(ADAPTER).get(`album/${id}`)
                .then(response => commit(ModelMutationTypes.ADD_MODEL, response, { root: true })),

        /**
         * Load an artist.
         *
         * @param commit
         * @param id
         */
        loadArtist: ({ commit }, id) =>
            getValue(ADAPTER).get(`artist/${id}`)
                .then(response => commit(ModelMutationTypes.ADD_MODEL, response, { root: true })),

        /**
         * Load songs by their ids.
         *
         * @param commit
         * @param ids
         */
        loadSongsById: ({ commit }, ids) =>
            getValue(ADAPTER).post('song', { ids }).then((response) => {
                commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, response, { root: true });

                return response.data;
            }),

        /**
         * Load a playlist.
         *
         * @param commit
         * @param id
         */
        loadPlaylist: ({ commit }, id) =>
            getValue(ADAPTER).get(`playlist/${id}`)
                .then(response => commit(ModelMutationTypes.ADD_MODEL, response, { root: true })),

        /**
         * Create a playlist.
         *
         * @param commit
         * @param rootState
         * @param name
         * @param description
         * @param isPrivate
         * @param songIds
         */
        createPlaylist: ({ commit }, {
            name, description = '', isPrivate = true, songIds = [],
        }) =>
            getValue(ADAPTER).put('playlist', {
                name,
                description,
                isPrivate,
                songs: songIds,
            }).then((response) => {
                commit(ModelMutationTypes.ADD_MODEL, response, { root: true });

                commit(CREATE_PLAYLIST);

                return response.data;
            }),

        /**
         * Add songs to a playlist.
         *
         * @param commit
         * @param rootState
         * @param id
         * @param songIds
         */
        addSongsToPlaylist: ({ commit, rootState }, { id, songIds }) =>
            getValue(ADAPTER).post(`playlist/${id}/add`, { id, songs: songIds }).then(({ data, included }) => {
                const playlist = rootState[ModelNamespace][ModelType.PLAYLIST][id];

                if (playlist) {
                    data.songCount = playlist.songCount + 1;

                    if (playlist.songIds) {
                        // Add the song ids to the playlist in store
                        data.songIds = playlist.songIds.concat(songIds);
                    }
                }

                commit(ModelMutationTypes.ADD_MODEL, { data, included }, { root: true });

                return data;
            }),

        /**
         * Save a playlist.
         *
         * @param commit
         * @param id
         * @param name
         * @param description
         * @param isPrivate
         */
        savePlaylist: ({ commit }, {
            id, name = '', description = '', isPrivate = true,
        }) =>
            getValue(ADAPTER).post(`playlist/${id}`, {
                name,
                description,
                isPrivate,
            }).then(response => commit(ModelMutationTypes.ADD_MODEL, response, { root: true })),

        /**
         * Delete a playlist.
         *
         * @param commit
         * @param id
         */
        deletePlaylist: ({ commit }, { id }) =>
            getValue(ADAPTER).delete(`playlist/${id}`).then(() => {
                commit(ModelMutationTypes.REMOVE_MODEL, { type: ModelType.PLAYLIST, id }, { root: true });

                commit(DELETE_PLAYLIST);
            }),


        /**
         * Set the order of a playlist's items.
         *
         * @param commit
         * @param id
         * @param songIds
         * @param items
         */
        setPlaylistOrder: ({ commit, rootState }, { id, songIds }) => {
            const playlist = rootState[ModelNamespace][ModelType.PLAYLIST][id];

            // save old order
            const savedOrder = playlist.songIds;

            // Eagerly set the order
            commit(ModelMutationTypes.ADD_MODEL, { data: { ...playlist, songIds } }, { root: true });

            // Try to update order on backend
            getValue(ADAPTER).post(`playlist/${id}/order`, { songs: songIds }).catch(() => {
                // revert the change if something went wrong in the backend
                commit(ModelMutationTypes.ADD_MODEL, { data: { ...playlist, songIds: savedOrder } }, { root: true });

                showFailNotification('Playlist order could not be saved.');
            });
        },

        /**
         * Remove specific indexes from a given playlist.
         *
         * @param commit
         * @param id
         * @param songIds
         * @param items
         */
        removePlaylistIndexes: ({ commit, rootState }, { id, indexes }) => {
            const playlist = rootState[ModelNamespace][ModelType.PLAYLIST][id];

            // sort indexes
            const sortedIndexes = indexes.sort((a, b) => b - a);

            // save old song ids
            const savedSongs = playlist.songIds;

            // Construct new song id array
            const newSongs = savedSongs.slice();
            for (let i = sortedIndexes.length - 1; i >= 0; i -= 1) {
                newSongs.splice(sortedIndexes[i], 1);
            }

            // Eagerly apply the changes
            commit(ModelMutationTypes.ADD_MODEL, {
                data: {
                    ...playlist,
                    songIds: newSongs,
                    songCount: newSongs.length,
                },
            }, { root: true });

            // Try to update order on backend
            getValue(ADAPTER).post(`playlist/${id}/remove`, { indexes }).catch(() => {
                // revert the change if something went wrong in the backend
                commit(ModelMutationTypes.ADD_MODEL, { data: { ...playlist, songIds: savedSongs } }, { root: true });

                showFailNotification('Item(s) could not be removed.');
            });
        },
    },

    mutations: {
        [CREATE_PLAYLIST]: (state) => {
            if (state.statistics && typeof state.statistics.playlistCount !== 'undefined') {
                state.statistics.playlistCount += 1;
            }

            state.totalPlaylists = (state.totalPlaylists || 0) + 1;
            // we can always increase the user playlists, because a playlist
            // can only be created by the currently authenticated user
            state.totalUserPlaylists = (state.totalUserPlaylists || 0) + 1;
        },

        [DELETE_PLAYLIST]: (state) => {
            if (state.statistics && typeof state.statistics.playlistCount !== 'undefined') {
                state.statistics.playlistCount -= 1;
            }

            if (state.totalPlaylists) {
                state.totalPlaylists -= 1;
            }

            if (state.totalUserPlaylists) {
                state.totalUserPlaylists -= 1;
            }
        },

        [LOAD_STATISTICS]: (state, { data }) => {
            state.statistics = data;
        },

        [LOAD_SUGGESTED_ALBUMS]: (state, { data }) => {
            state.suggestedAlbumIds = data.map(album => album.id);
        },

        [LOAD_POPULAR_SONGS]: (state, { data }) => {
            state.popularSongIds = data.map(song => song.id);
        },

        [LOAD_ARTISTS]: (state, { data: { offset, take, total } }) => {
            state.artistOffset = offset + take;
            state.totalArtists = total;
        },

        [LOAD_ALBUMS]: (state, { data: { offset, take, total } }) => {
            state.albumOffset = offset + take;
            state.totalAlbums = total;
        },

        [LOAD_PLAYLISTS]: (state, { data: { offset, take, total } }) => {
            state.playlistOffset = offset + take;
            state.totalPlaylists = total;
        },

        [LOAD_USER_PLAYLISTS]: (state, { data: { offset, take, total } }) => {
            state.userPlaylistOffset = offset + take;
            state.totalUserPlaylists = total;
        },

        [CLEAR]: (state) => {
            setToInitialState(state, initialState());
        },
    },
};
