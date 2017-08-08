import VueTypes from 'vue-types';

// TODO: FIX proptypes

const art = VueTypes.shape({
    id: VueTypes.number,
    md5: VueTypes.string,
    src: VueTypes.string,
}).loose;

const item = VueTypes.shape({
    id: VueTypes.number,
    index: VueTypes.number,
    title: VueTypes.string,
    songId: VueTypes.string,
}).loose;

const role = VueTypes.shape({
    id: VueTypes.number,
    name: VueTypes.string,
}).loose;

const playlist = VueTypes.shape({
    id: VueTypes.string,
    type: VueTypes.oneOf(['playlist']),
    name: VueTypes.string,
    items: VueTypes.arrayOf(item),
    private: VueTypes.bool,
    ownerId: VueTypes.string,
}).loose;

const user = VueTypes.shape({
    id: VueTypes.string,
    type: VueTypes.oneOf(['user']),
    name: VueTypes.string,
    playlistIds: VueTypes.arrayOf(VueTypes.string),
    roles: VueTypes.arrayOf(role),
    queue: VueTypes.shape({
        id: VueTypes.string,
        items: VueTypes.arrayOf(item),
        userId: VueTypes.string,
    }).loose,
}).loose;

const album = VueTypes.shape({
    id: VueTypes.string,
    type: VueTypes.oneOf(['album']),
    name: VueTypes.string,
    viewed: VueTypes.number,
    year: VueTypes.number,
    arts: VueTypes.arrayOf(art),
    artistId: VueTypes.string,
    featuredArtistIds: VueTypes.arrayOf(VueTypes.string),
    songIds: VueTypes.arrayOf(VueTypes.string),
    artist: VueTypes.object,
}).loose;

const artist = VueTypes.shape({
    id: VueTypes.string,
    type: VueTypes.oneOf(['artist']),
    name: VueTypes.string,
    viewed: VueTypes.number,
    albumIds: VueTypes.arrayOf(VueTypes.string),
    featuredAlbumIds: VueTypes.arrayOf(VueTypes.string),
    songIds: VueTypes.arrayOf(VueTypes.string),
}).loose;

const song = VueTypes.shape({
    id: VueTypes.string,
    type: VueTypes.oneOf(['song']),
    title: VueTypes.string,
    trackNumber: VueTypes.number,
    duration: VueTypes.number,
    format: VueTypes.string,
    genre: VueTypes.any, // TODO: fixme
    artistId: VueTypes.string,
    albumId: VueTypes.string,
}).loose;

export default {
    user,
    song,
    item,
    album,
    artist,
    playlist,
};
