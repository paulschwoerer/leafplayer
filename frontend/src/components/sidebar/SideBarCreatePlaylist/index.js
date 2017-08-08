import store from 'store/index';
import { DropTarget } from 'dnd/index';
import DnDTypes from 'data/enum/DnDTypes';
import CreatePlaylistModal from 'components/modal/CreatePlaylistModal';
import {
    getAlbum,
    getArtist,
    getPlaylist,
    loadAlbumWithSongIds,
    loadArtistWithSongIds,
    loadPlaylistWithSongIds,
} from 'utils/mediaUtils';

import SideBarCreatePlaylist from './SideBarCreatePlaylist';

const openModal = (songIds) => store.dispatch('modal/openModal', {
    component: CreatePlaylistModal,
    props: {
        songIdsToAdd: songIds,
    },
});

const target = {
    drop(dropTarget, dragMonitor) {
        const data = dragMonitor.getData();

        switch (dragMonitor.getType()) {
            case DnDTypes.ALBUM_CARD:
                loadAlbumWithSongIds(data.albumId)
                    .then(() => openModal(getAlbum(data.albumId).songIds));

                break;
            case DnDTypes.PLAYLIST_CARD:
                loadPlaylistWithSongIds(data.playlistId)
                    .then(() => openModal(getPlaylist(data.playlistId).songIds));

                break;
            case DnDTypes.ARTIST_CARD:
                loadArtistWithSongIds(data.artistId)
                    .then(() => openModal(getArtist(data.artistId).songIds));

                break;
            case DnDTypes.SONG_LIST_ENTRY:
                openModal(data.songIds);
                break;
            default:
                break;
        }
    },
};

export default DropTarget([
    DnDTypes.SONG_LIST_ENTRY,
    DnDTypes.ALBUM_CARD,
    DnDTypes.ARTIST_CARD,
    DnDTypes.PLAYLIST_CARD,
], target)(SideBarCreatePlaylist);
