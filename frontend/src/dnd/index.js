import dragSource from './DragSource';
import dropTarget from './DropTarget';
import storeModule from './storeModule';

const install = (Vue, options) => {
    if (!options || !options.store) {
        throw new Error('[VueDnD] Please pass the store in with the options when initializing this plugin.');
    }

    options.store.registerModule('dnd', storeModule);
};

export const DragSource = dragSource;
export const DropTarget = dropTarget;

export default {
    DragSource: dragSource,
    DropTarget: dropTarget,
    install,
};
