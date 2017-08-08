import store from 'store/index';
import { DropTarget } from 'dnd/index';
import DnDTypes from 'data/enum/DnDTypes';
import { MediaNamespace } from 'store/modules/media';
import { showSuccessNotification, showFailNotification } from 'utils/notificationUtils';
import {
    getAlbum,
    getArtist,
    getPlaylist,
    loadAlbumWithSongIds,
    loadArtistWithSongIds,
    loadPlaylistWithSongIds,
} from 'utils/mediaUtils';

import SideBarPlaylistLink from './SideBarPlaylistLink';

/**
 * Add songs to playlist.
 *
 * @param playlist
 * @param songIds
 */
const addSongsToPlaylist = (playlist, songIds) =>
    store.dispatch(`${MediaNamespace}/addSongsToPlaylist`, { id: playlist.id, songIds })
        .then(() => showSuccessNotification(`${songIds.length} song(s) added to playlist '${playlist.name}'`))
        .catch(() => showFailNotification('Failed to add songs to playlist'));

const target = {
    // Only allow dropping on playlists, the user owns.
    canDrop: dropTarget => {
        const { owner, ownerId } = dropTarget.playlist;

        return (owner ? owner.id : ownerId) === store.state.auth.userId;
    },

    drop(dropTarget, dragMonitor) {
        const data = dragMonitor.getData();

        switch (dragMonitor.getType()) {
            case DnDTypes.ALBUM_CARD:
                loadAlbumWithSongIds(data.albumId)
                    .then(() => addSongsToPlaylist(dropTarget.playlist, getAlbum(data.albumId).songIds));

                break;
            case DnDTypes.ARTIST_CARD:
                loadArtistWithSongIds(data.artistId)
                    .then(() => addSongsToPlaylist(dropTarget.playlist, getArtist(data.artistId).songIds));

                break;
            case DnDTypes.PLAYLIST_CARD:
                loadPlaylistWithSongIds(data.playlistId)
                    .then(() => addSongsToPlaylist(dropTarget.playlist, getPlaylist(data.playlistId).songIds));

                break;
            case DnDTypes.SONG_LIST_ENTRY: {
                addSongsToPlaylist(dropTarget.playlist, data.songIds);
                break;
            }
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
], target)(SideBarPlaylistLink);
