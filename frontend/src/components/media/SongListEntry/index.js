import DnDTypes from 'data/enum/DnDTypes';
import { createDragImage } from 'utils/dndUtils';
import { DragSource, DropTarget } from 'dnd/index';

import SongListEntry from './SongListEntry';

const target = {
    canDrop(dropTarget, dragMonitor) {
        return dropTarget.allowSongSorting && dropTarget.index !== dragMonitor.getData().songListIndex;
    },

    drop(dropTarget, dragMonitor) {
        dropTarget.onSongDropped(dragMonitor.getData().songListIndex, dropTarget.index);
    },
};

const source = {
    dragData(item) {
        return {
            id: item.song.id,
            // title: item.song.title,
            songIds: [item.song.id],
            songListIndex: item.index,
        };
    },

    dragPreview() {
        return createDragImage('1 Song');
    },
};

export default DropTarget(
    [DnDTypes.SONG_LIST_ENTRY],
    target,
)(DragSource(DnDTypes.SONG_LIST_ENTRY, source)(SongListEntry));

