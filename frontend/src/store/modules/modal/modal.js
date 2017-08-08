import { setToInitialState } from 'utils/storeUtils';
import { CLEAR } from 'store/globalMutations';

export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

const createModalConfig = (component, props) => ({
    getComponent() {
        return component;
    },

    getProps() {
        return props;
    },
});

const initialState = () => ({
    // determines if a modal is currently visible
    visible: false,

    // the props that should be passed to the modal
    modalConfig: null,
});

export default {
    namespaced: true,

    state: initialState(),

    actions: {
        closeModal: ({ commit }) =>
            commit(CLOSE_MODAL),

        openModal: ({ commit }, payload) =>
            commit(OPEN_MODAL, payload),
    },

    mutations: {
        [CLOSE_MODAL]: (state) => {
            state.visible = false;
            state.modalConfig = null;
        },

        [OPEN_MODAL]: (state, { component, props }) => {
            state.visible = true;
            state.modalConfig = createModalConfig(component, props);
        },

        [CLEAR]: (state) => {
            setToInitialState(state, initialState());
        },
    },
};
