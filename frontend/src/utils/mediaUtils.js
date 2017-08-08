import store from 'store/index';
import EventBus from 'store/eventbus';
import ModelType from 'data/enum/ModelType';

import { findModel } from './modelUtils';

/**
 * Parse relationships of a given artist.
 *
 * @returns artist
 * @param artist
 */
export const parseArtist = artist => artist;

/**
 * Get artist.
 *
 * @param id
 * @returns object
 */
export const getArtist = (id) => {
    const artist = findModel(ModelType.ARTIST, id);

    return artist ? parseArtist(artist) : null;
};

/**
 * Parse relationships of a given album.
 *
 * @param album
 * @returns object
 */
export const parseAlbum = album => ({
    ...album,
    artist: findModel(ModelType.ARTIST, album.artist ?
        album.artist.id : album.artistId) || album.artist || { id: album.artistId },
});

/**
 * Get album.
 *
 * @param id
 * @returns object
 */
export const getAlbum = (id) => {
    const album = findModel(ModelType.ALBUM, id);

    return album ? parseAlbum(album) : null;
};


/**
 * Parse relationships of a given song.
 *
 * @param song
 * @returns object
 */
export const parseSong = song => ({
    ...song,
    artist: findModel(ModelType.ARTIST, song.artist ?
        song.artist.id : song.artistId) || song.artist || { id: song.artistId },
    album: findModel(ModelType.ALBUM, song.album ?
        song.album.id : song.albumId) || song.album || { id: song.albumId },
});

/**
 * Get song with parsed relationships.
 *
 * @param id
 * @returns object
 */
export const getSong = (id) => {
    const song = findModel(ModelType.SONG, id);

    return song ? parseSong(song) : null;
};

/**
 * Parse relationships of a given playlist.
 *
 * @param playlist
 * @returns object
 */
export const parsePlaylist = playlist => ({
    ...playlist,
    owner: findModel(ModelType.USER, playlist.owner ?
        playlist.owner.id : playlist.ownerId) || playlist.owner || { id: playlist.ownerId },
});

/**
 * Get playlist with parsed relationships.
 *
 * @param id
 * @returns object
 */
export const getPlaylist = (id) => {
    const playlist = findModel(ModelType.PLAYLIST, id);

    return playlist ? parsePlaylist(playlist) : null;
};

/**
 * Loads an album from the backend, if the album or it's song ids are not loaded yet.
 * Also takes into account if the album's song count has been modified.
 *
 * @param id
 * @returns Promise
 */
export const loadAlbumWithSongIds = (id) => {
    const album = getAlbum(id);

    return (!album || !album.songIds || (album.songCount !== album.songIds.length)
        ? store.dispatch(`${'media'}/loadAlbum`, id) : Promise.resolve());
};

/**
 * Loads an artist from the backend, if the artist or it's song ids are not loaded yet.
 * Also takes into account if the artist's song count has been modified.
 *
 * @param id
 * @returns Promise
 */
export const loadArtistWithSongIds = (id) => {
    const artist = getArtist(id);

    return (!artist || !artist.songIds || (artist.songCount !== artist.songIds.length)
        ? store.dispatch(`${'media'}/loadArtist`, id) : Promise.resolve());
};

/**
 * Loads a playlist from the backend, if the playlist or it's song ids are not loaded yet.
 * Also takes into account if the playlist's song count has been modified.
 *
 * @param id
 * @returns Promise
 */
export const loadPlaylistWithSongIds = (id) => {
    const playlist = getPlaylist(id);

    return (!playlist || !playlist.songIds || (playlist.songCount !== playlist.songIds.length) ?
        store.dispatch(`${'media'}/loadPlaylist`, id) : Promise.resolve());
};

/**
 * Check a bunch of song ids for their availability and load them from the backend if necessary.
 *
 * @param songIds
 * @returns Promise
 */
export const loadSongs = (songIds) => {
    const loadIds = songIds.filter(id => !getSong(id));

    return (loadIds.length ?
        store.dispatch(`${'media'}/loadSongsById`, loadIds) : Promise.resolve());
};

/**
 * Set the player queue.
 *
 * @param songIds
 * @param songId
 * @param suppressAlert
 * @param play
 */
export const setQueueFromSongs = (songIds, songId, suppressAlert = false, play = true) => {
    const index = songIds.findIndex(id => id === songId);

    EventBus.$emit('player:setQueue', {
        songIds,
        index: index >= 0 ? index : 0,
        play,
        suppressAlert,
    });
};

