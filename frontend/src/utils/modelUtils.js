import store from 'store/index';
import { ModelNamespace } from 'store/modules/model';

/**
 * Returns all models of a specific type as an array.
 *
 * @param type
 * @returns Array
 */
export const getAllModelsOfType = type =>
    store.getters[`${ModelNamespace}/allModelsOfType`](type);

/**
 * Check if a model with given type and id exists.
 *
 * @param type
 * @param id
 */
export const modelExists = (type, id) =>
    store.getters[`${ModelNamespace}/modelExists`](type, id);

/**
 * Find a model by its type and id.
 *
 * @param type
 * @param id
 * @returns object
 */
export const findModel = (type, id) => {
    if (!modelExists(type, id)) {
        return null;
    }

    return store.getters[`${ModelNamespace}/model`](type, id);
};
