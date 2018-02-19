<?php

use App\LeafPlayer\Exceptions\NotFoundException;
 
// Match API methods
$app->group(['prefix' => 'api'], function() use ($app) {
    $app->group(['middleware' => ['throttle:10,2']], function() use ($app) {
        $app->post('auth/authenticate', 'AuthApiController@authenticate');
    });

    $app->group(['middleware' => ['throttle:100,1']], function() use ($app) {
        $app->post('auth/refresh', 'AuthApiController@refreshToken');

        /* SETUP */
        $app->post('setup/create-admin', 'SetupApiController@setupAdminAccount');
        $app->get('setup/needs-setup', 'SetupApiController@needsSetup');
    });

    $app->group(['middleware' => ['throttle:100,1', 'auth:api'/*, 'jwt.refresh'*/]], function() use ($app) {
        /* AUTHENTICATION */
        $app->get('auth/user', 'AuthApiController@getCurrentUser');
        $app->post('auth/logout', 'AuthApiController@logout');

        $app->group(['middleware' => 'throttle:10,2'], function() use ($app) {
            $app->post('auth/password', 'AuthApiController@changeUserPassword');
        });

        /* USER */
        $app->get('user', 'UserApiController@queryUsers');
        $app->put('user', 'UserApiController@createUser');
        $app->get('user/{id}', 'UserApiController@getUser');
        $app->get('user/{id}/playlists', 'UserApiController@getUserPlaylists');
        $app->delete('user/{id}', 'UserApiController@removeUser');

        /* MISC */
        $app->get('suggested/albums', 'AlbumApiController@getSuggestedAlbums');
        $app->get('popular/songs', 'SongApiController@getPopularSongs');

        /* FAVORITES */
        $app->get('favorites', 'FavoritesApiController@getFavorites');
        $app->post('favorites', 'FavoritesApiController@addFavorites');
        $app->delete('favorites', 'FavoritesApiController@removeFavorites');

        /* ALBUM */
        $app->get('album', 'AlbumApiController@getAlbums');
        $app->get('album/{id}', 'AlbumApiController@getAlbum');

        /* ARTIST */
        $app->get('artist', 'ArtistApiController@getArtists');
        $app->get('artist/{id}', 'ArtistApiController@getArtist');

        /* PLAYLIST */
        $app->get('playlist', 'PlaylistApiController@getPlaylists');
        $app->put('playlist', 'PlaylistApiController@createPlaylist');
        $app->get('playlist/{id}', 'PlaylistApiController@getPlaylist');
        $app->delete('playlist/{id}', 'PlaylistApiController@deletePlaylist');
        $app->post('playlist/{id}/add', 'PlaylistApiController@addSongsToPlaylist');
        $app->post('playlist/{id}', 'PlaylistApiController@updatePlaylistProperties');
        $app->post('playlist/{id}/order', 'PlaylistApiController@setPlaylistOrder');
        $app->post('playlist/{id}/remove', 'PlaylistApiController@removeIndexesFromPlaylist');


        /* SONG */
        $app->get('song/{id}/stream', 'SongApiController@streamSong');
        $app->get('song/{id}/download', 'SongApiController@downloadSong');
        // Use post to be able to be able to send an array in the request
        $app->post('song', 'SongApiController@getSongsById');

        /* COLLECTION */
        $app->get('collection/statistics', 'CollectionApiController@getCollectionStatistics');
        $app->post('collection/search', 'CollectionApiController@searchCollection');

        /* LIBRARY */
        $app->post('library/scan', 'LibraryApiController@startScan');
        $app->post('library/clean', 'LibraryApiController@cleanLibrary');
        $app->post('library/wipe', 'LibraryApiController@wipeLibrary');
        $app->get('library/scan-progress', 'LibraryApiController@getScanProgress');
        $app->get('library/folder', 'LibraryApiController@getAllFolders');
        $app->get('library/folder/check', 'LibraryApiController@checkFolder');
        $app->delete('library/folder/{id}', 'LibraryApiController@removeFolder');
        $app->post('library/folder/{id}', 'LibraryApiController@updateFolderSelectedState');
        $app->put('library/folder', 'LibraryApiController@addFolder');
    });
	
	// Catch non existing API methods
	$app->addRoute(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'], '/{slug:.*}', function() {
		throw new NotFoundException('not_found');
	});   
});

// Forward all non API routes to SPA
$app->get('/{slug:.*}', function() {
	return view('index');
});

