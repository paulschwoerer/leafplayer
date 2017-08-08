import Vue from 'vue';
import { assert } from 'utils/debugUtils';
import { CLEAR } from 'store/globalMutations';
import ModelType from 'data/enum/ModelType';
import { setToInitialState } from 'utils/storeUtils';

export const ADD_MODEL = 'ADD_MODEL';
export const REMOVE_MODEL = 'REMOVE_MODEL';
export const ADD_MULTIPLE_MODELS = 'ADD_MULTIPLE_MODELS';

/**
 * Add a model to the state or replace existing.
 *
 * @param state The model state
 * @param model
 */
const addModel = (state, model) => {
    assert(typeof model.type === 'string' && typeof model.id !== 'undefined',
        '[model::addModel] A model needs a type and an id.');

    // If the given model is already in store, merge the new values in to prevent data loss.
    const modelData = {
        ...(state[model.type][model.id] || {}),
        ...model,
    };

    Vue.set(state[model.type], model.id, modelData);
};

/**
 * Add multiple models at once.
 *
 * @param state The model state
 * @param models
 */
const addMultipleModels = (state, models) => {
    assert(models instanceof Array, '[model::addMultipleModels] An array of models should be passed to this method.');

    models.forEach(model => addModel(state, model));
};

/**
 * Remove a model from the state if it exists.
 *
 * @param state The model state
 * @param model
 */
const removeModel = (state, model) => {
    assert(typeof model.type === 'string' && typeof model.id !== 'undefined',
        '[model::removeModel] A model needs a type and an id.');

    Vue.delete(state[model.type], model.id);
};

// Initial state of the module
const initialState = () => ({
    [ModelType.ALBUM]: {},
    [ModelType.ARTIST]: {},
    [ModelType.SONG]: {},
    [ModelType.PLAYLIST]: {},
    [ModelType.USER]: {},
});

/**
 * This module contains model specific mutations and state.
 */
export default {
    namespaced: true,

    state: initialState(),

    mutations: {
        [ADD_MODEL]: (state, { data, included = [] }) => {
            addMultipleModels(state, included);
            addModel(state, data);
        },

        [ADD_MULTIPLE_MODELS]: (state, { data, included = [] }) => {
            addMultipleModels(state, included);
            addMultipleModels(state, data);
        },

        [REMOVE_MODEL]: (state, model) => {
            removeModel(state, model);
        },

        [CLEAR]: (state) => {
            setToInitialState(state, initialState());
        },
    },

    getters: {
        /**
         * Returns an unordered array of models of a specific type.
         *
         * @param state
         */
        allModelsOfType: state => type =>
            Object.keys(state[type]).map(key => state[type][key]),

        /**
         * Get a model by its type and id.
         *
         * @param state
         */
        model: state => (type, id) =>
            state[type][id],

        /**
         * Check if a model exists in the state.
         *
         * @param state
         */
        modelExists: state => (type, id) =>
            !!state[type][id],

    },
};
