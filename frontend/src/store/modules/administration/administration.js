import { getValue } from 'utils/injector';
import { ADAPTER } from 'data/Injectables';
import ModelType from 'data/enum/ModelType';
import { CLEAR } from 'store/globalMutations';
import ScannerState from 'data/enum/ScannerState';
import { serializeUrlParams } from 'utils/urlUtils';
import { setToInitialState } from 'utils/storeUtils';
import { ConfigMutationTypes } from '../config';

import { ModelMutationTypes } from '../model';

export const ADD_FOLDER = 'ADD_FOLDER';
export const REMOVE_FOLDER = 'REMOVE_FOLDER';
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS';
export const LOAD_ALL_FOLDERS = 'LOAD_ALL_FOLDERS';
export const CREATE_ADMIN_ACCOUNT = 'CREATE_ADMIN_ACCOUNT';
export const UPDATE_FOLDER_SELECTED_STATE = 'UPDATE_FOLDER_SELECTED_STATE';

const initialState = () => ({
    // list of scanner folders
    folders: [],

    // user pagination data
    userOffset: 0,
    totalUsers: NaN,

    needsSetup: false,

    // current scan progress
    scan: {
        running: false,
        details: {
            type: '',
            currentState: ScannerState.FINISHED,
            currentFile: '',
            scannedFiles: 0,
            totalFiles: 0,
        },
    },
});

export default {
    namespaced: true,

    state: initialState(),

    actions: {
        /**
         * Create a user.
         *
         * @param commit
         * @param id
         * @param name
         * @param password
         * @param roles
         */
        createUser: ({ commit }, {
            id, name, password, roles,
        }) =>
            getValue(ADAPTER).put('user', {
                id,
                name,
                password,
                roles: roles || [],
            }).then(response => commit(ModelMutationTypes.ADD_MODEL, response, { root: true })),

        /**
         * Load users from backend.
         *
         * @param commit
         * @param offset
         * @param take
         */
        loadUsers: ({ commit }, { offset, take }) =>
            getValue(ADAPTER).get(`user${serializeUrlParams({ offset, take })}`).then((response) => {
                commit(ModelMutationTypes.ADD_MULTIPLE_MODELS, { data: response.data.items }, { root: true });
            }),

        /**
         * Delete a specific user.
         *
         * @param commit
         * @param id
         */
        deleteUser: ({ commit }, { id }) =>
            getValue(ADAPTER).delete(`user/${id}`)
                .then(() => commit(ModelMutationTypes.REMOVE_MODEL, { type: ModelType.USER, id }, { root: true })),

        /**
         * Load all scanner folders.
         *
         * @param commit
         */
        loadAllFolders: ({ commit }) =>
            getValue(ADAPTER).get('library/folder')
                .then(response => commit(LOAD_ALL_FOLDERS, response)),

        /**
         * Add a scanner folder.
         *
         * @param commit
         * @param path
         * @param selected
         */
        addFolder: ({ commit }, { path, selected = true }) =>
            getValue(ADAPTER).put('library/folder', {
                path,
                selected,
            }).then(({ data }) => commit(ADD_FOLDER, data)),

        /**
         * Select or deselect a folder.
         *
         * @param commit
         * @param id
         * @param selected
         */
        updateFolderSelectedState: ({ commit }, { id, selected }) =>
            getValue(ADAPTER).post(`library/folder/${id}`, {
                selected,
            }).then(response => commit(UPDATE_FOLDER_SELECTED_STATE, response)),

        /**
         * Remove a folder from the library.
         *
         * @param commit
         * @param id
         */
        removeFolder: ({ commit }, { id }) =>
            getValue(ADAPTER).delete(`library/folder/${id}`, {
                id,
            }).then(() => commit(REMOVE_FOLDER, id)),

        /**
         * Update the progress of the currently active scan.
         *
         * @param commit
         * @param data
         */
        updateProgress: ({ commit }, data) => commit(UPDATE_PROGRESS, data),

        createAdminAccount: ({ commit }, { username, displayName, password }) =>
            getValue(ADAPTER).put('setup/create-admin', {
                id: username,
                name: displayName,
                password,
            }).then(() => commit(ConfigMutationTypes.SET_SETUP, false)),
    },

    mutations: {
        [LOAD_ALL_FOLDERS]: (state, { data }) => {
            state.folders = data;
        },

        [ADD_FOLDER]: (state, payload) => {
            state.folders.push(payload);
        },

        [UPDATE_FOLDER_SELECTED_STATE]: (state, { data: newFolder }) => {
            state.folders = state.folders.map(folder => (folder.id === newFolder.id ? newFolder : folder));
        },

        [REMOVE_FOLDER]: (state, payload) => {
            state.folders = state.folders.filter(folder => folder.id !== payload);
        },

        [UPDATE_PROGRESS]: (state, payload) => {
            state.scan = payload;
        },

        [CLEAR]: (state) => {
            setToInitialState(state, initialState());
        },
    },
};
