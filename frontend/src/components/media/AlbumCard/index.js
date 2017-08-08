import { DragSource } from 'dnd/index';
import DnDTypes from 'data/enum/DnDTypes';
import { createDragImage } from 'utils/dndUtils';

import AlbumCard from './AlbumCard';

const source = {
    dragData: item => ({
        albumId: item.album.id,
        songCount: item.album.songCount,
    }),

    dragPreview(dragData) {
        return createDragImage(`1 Album, ${dragData.songCount} Song(s)`);
    },
};

export default DragSource(DnDTypes.ALBUM_CARD, source)(AlbumCard);
