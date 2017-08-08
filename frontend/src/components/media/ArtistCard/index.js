import { DragSource } from 'dnd/index';
import DnDTypes from 'data/enum/DnDTypes';
import { createDragImage } from 'utils/dndUtils';

import ArtistCard from './ArtistCard';

const source = {
    dragData: item => ({
        artistId: item.artist.id,
        songCount: item.artist.songCount,
        albumCount: item.artist.albumCount,
    }),

    dragPreview(dragData) {
        return createDragImage(`1 Artist, ${dragData.albumCount} Album(s), ${dragData.songCount} Song(s)`);
    },
};

export default DragSource(DnDTypes.ARTIST_CARD, source)(ArtistCard);
