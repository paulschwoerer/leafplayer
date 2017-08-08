import ModelType from 'data/enum/ModelType';
import { CLEAR } from 'store/globalMutations';
import PlayerMode from 'data/enum/PlayerMode';
import { setToInitialState } from 'utils/storeUtils';

import { ModelNamespace } from "../model";

export const SET_MODE = 'SET_MODE';
export const SET_QUEUE = 'SET_QUEUE';
export const SET_CURRENT_SONG_ID = 'SET_CURRENT_SONG_ID';
export const SET_PLAYBACK_HISTORY = 'SET_PLAYBACK_HISTORY';
export const SET_CURRENT_QUEUE_INDEX = 'SET_CURRENT_QUEUE_INDEX';

const initialState = () => ({
    currentQueueIndex: 0,

    currentSongId: null,

    mode: PlayerMode.STOPPED,

    queue: [],

    playbackHistory: [],
});

/**
 * This is the store player module. Actions should only be called by the
 * Player component to guarantee that this module and the actual player are in sync
 *
 * Other components are free to get all the data they want, but should use
 * the "player:*" events to change the player's state.
 */
export default {
    namespaced: true,

    state: initialState(),

    actions: {
        /**
         * Set the current playing mode.
         *
         * @param commit
         * @param mode Can be any value defined in PlayerMode
         */
        setMode: ({ commit }, { mode }) =>
            commit(SET_MODE, { mode }),

        /**
         * Set the current queue to the given song(ids).
         *
         * @param commit
         * @param songIds
         */
        setQueue: ({ commit }, { songIds }) =>
            commit(SET_QUEUE, { songIds }),

        /**
         * Set the current playback history of the player
         * ( useful for going back a song while shuffle is enabled )
         *
         * Every single history item should have the following structure:
         *  {
         *      id: song_id,
         *      index: queue_index
         *  }
         *
         * @param commit
         * @param history
         */
        setPlaybackHistory: ({ commit }, { history }) =>
            commit(SET_PLAYBACK_HISTORY, { history }),

        /**
         * Set the ID of the currently playing song.
         *
         * @param commit
         * @param id
         */
        setCurrentSongId: ({ commit }, { id }) =>
            commit(SET_CURRENT_SONG_ID, { id }),

        /**
         * Set the current queue index.
         *
         * @param commit
         * @param index
         */
        setCurrentQueueIndex: ({ commit }, { index }) =>
            commit(SET_CURRENT_QUEUE_INDEX, { index }),
    },

    mutations: {
        [SET_MODE]: (state, { mode }) => {
            state.mode = mode;
        },

        [SET_QUEUE]: (state, { songIds }) => {
            state.queue = songIds;
        },

        [SET_CURRENT_SONG_ID]: (state, { id }) => {
            state.currentSongId = id;
        },

        [SET_PLAYBACK_HISTORY]: (state, { history }) => {
            state.playbackHistory = history;
        },

        [SET_CURRENT_QUEUE_INDEX]: (state, { index }) => {
            state.currentQueueIndex = index;
        },

        [CLEAR]: (state) => {
            setToInitialState(state, initialState());
        },
    },

    getters: {
        currentSong: (state, getters, rootState) =>
            (state.currentSongId ? rootState[ModelNamespace][ModelType.SONG][state.currentSongId] || null : null),

        isPlaying: state =>
            state.mode === PlayerMode.PLAYING,

        isPaused: state =>
            state.mode === PlayerMode.PAUSED,

        isStopped: state =>
            state.mode === PlayerMode.STOPPED,

        isLoading: state =>
            state.mode === PlayerMode.LOADING,

        queueSize: state =>
            state.queue.length,

        queueSongs: (state, getters, rootState) =>
            state.queue.map(id => rootState[ModelNamespace][ModelType.SONG][id] || null),
    },
};
