import store from 'store/index';
import EventBus from 'store/eventbus';
import { DropTarget } from 'dnd/index';
import DnDTypes from 'data/enum/DnDTypes';
import { showFailNotification } from 'utils/notificationUtils';
import {
    getAlbum,
    getArtist,
    getPlaylist,
    loadAlbumWithSongIds,
    loadArtistWithSongIds,
    loadPlaylistWithSongIds,
    loadSongs,
} from 'utils/mediaUtils';

import PlayerArt from './PlayerArt';

/**
 * Add an array of given song ids to the player queue.
 *
 * @param songIds
 */
const addSongsToQueue = (songIds) => loadSongs(songIds)
    .then(() => EventBus.$emit('player:addSongs', { songIds }))
    .catch(() => showFailNotification('Failed to enqueue.'));

const target = {
    drop(dropTarget, dragMonitor) {
        const data = dragMonitor.getData();

        switch (dragMonitor.getType()) {
            // Handle dropping of an album card
            case DnDTypes.ALBUM_CARD:
                loadAlbumWithSongIds(data.albumId)
                    .then(() => addSongsToQueue(getAlbum(data.albumId).songIds));

                break;
            // handle dropping of an artist card
            case DnDTypes.ARTIST_CARD:
                loadArtistWithSongIds(data.artistId)
                    .then(() => addSongsToQueue(getArtist(data.artistId).songIds));

                break;
            // handle dropping of a playlist card
            case DnDTypes.PLAYLIST_CARD:
                loadPlaylistWithSongIds(data.playlistId)
                    .then(() => addSongsToQueue(getPlaylist(data.playlistId).songIds));

                break;
            // handle dropping of a song list entry
            case DnDTypes.SONG_LIST_ENTRY:
                addSongsToQueue(data.songIds);
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
], target)(PlayerArt);
