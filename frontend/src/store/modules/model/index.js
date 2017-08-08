import model, {
    ADD_MODEL,
    REMOVE_MODEL,
    ADD_MULTIPLE_MODELS,
} from './model';

export const ModelNamespace = 'model';

export const ModelMutationTypes = {
    ADD_MODEL: `${ModelNamespace}/${ADD_MODEL}`,
    REMOVE_MODEL: `${ModelNamespace}/${REMOVE_MODEL}`,
    ADD_MULTIPLE_MODELS: `${ModelNamespace}/${ADD_MULTIPLE_MODELS}`,
};

export default model;
