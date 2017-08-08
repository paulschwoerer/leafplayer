import { DragSource } from 'dnd/index';
import DnDTypes from 'data/enum/DnDTypes';
import { createDragImage } from 'utils/dndUtils';

import PlaylistCard from './PlaylistCard';

const source = {
    dragData: item => ({
        playlistId: item.playlist.id,
        songCount: item.playlist.songCount,
    }),

    dragPreview(dragData) {
        return createDragImage(`1 Playlist, ${dragData.songCount} Song(s)`);
    },
};

export default DragSource(DnDTypes.PLAYLIST_CARD, source)(PlaylistCard);
