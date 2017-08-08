import Home from 'routes/Home';
import Queue from 'routes/Queue';
import Album from 'routes/Album';
import Login from 'routes/Login';
import Playlist from 'routes/Playlist';
import NotFound from 'routes/NotFound';
import Artist from 'routes/Artist';

import Favorites from 'routes/Favorites';

import Collection from 'routes/Collection';
import CollectionAlbums from 'routes/Collection/Albums';
import CollectionArtists from 'routes/Collection/Artists';
import CollectionPlaylists from 'routes/Collection/Playlists';

import Settings from 'routes/Settings';

import Administration from 'routes/Administration';
import AdministrationUsers from 'routes/Administration/Users';
import AdministrationCollection from 'routes/Administration/Collection';

import Search from 'routes/Search';

import Params from 'data/enum/Params';
import PageNames from 'data/enum/PageNames';


export default [
    {
        path: '/',
        name: PageNames.HOME,
        component: Home,
        meta: { auth: true },
    },
    {
        path: '/favorites',
        name: PageNames.FAVORITES,
        component: Favorites,
        meta: { auth: true },
    },
    {
        path: '/collection',
        name: PageNames.COLLECTION,
        component: Collection,
        meta: { auth: true },
        redirect: '/collection/artists',
        children: [
            {
                path: 'artists',
                name: PageNames.COLLECTION_ARTISTS,
                component: CollectionArtists,
            },
            {
                path: 'albums',
                name: PageNames.COLLECTION_ALBUMS,
                component: CollectionAlbums,
            },
            {
                path: 'playlists',
                name: PageNames.COLLECTION_PLAYLISTS,
                component: CollectionPlaylists,
            },
        ],
    },
    {
        path: `/artist/:${Params.ARTIST_ID}`,
        name: PageNames.ARTIST,
        component: Artist,
        meta: { auth: true },
    },
    {
        path: `/album/:${Params.ALBUM_ID}`,
        name: PageNames.ALBUM,
        component: Album,
        meta: { auth: true },
    },
    {
        path: `/playlist/:${Params.PLAYLIST_ID}`,
        name: PageNames.PLAYLIST,
        component: Playlist,
        meta: { auth: true },
    },
    {
        path: '/settings',
        name: PageNames.SETTINGS,
        component: Settings,
        meta: { auth: true },
    },
    {
        path: '/queue',
        name: PageNames.QUEUE,
        component: Queue,
        meta: { auth: true },
    },
    {
        path: `/search/:${Params.SEARCH_QUERY}?`,
        name: PageNames.SEARCH,
        component: Search,
        meta: { auth: true },
    },
    {
        path: '/administration',
        name: PageNames.ADMINISTRATION,
        component: Administration,
        meta: { auth: 'admin' },
        redirect: '/administration/collection',
        children: [
            {
                path: 'collection',
                name: PageNames.ADMINISTRATION_COLLECTION,
                component: AdministrationCollection,
            },
            {
                path: 'users',
                name: PageNames.ADMINISTRATION_USERS,
                component: AdministrationUsers,
            },
        ],
    },
    {
        path: '/login',
        name: PageNames.LOGIN,
        component: Login,
        meta: { auth: false },
    },
    {
        path: '*',
        name: PageNames.NOT_FOUND,
        component: NotFound,
        meta: { auth: true },
    },
];
