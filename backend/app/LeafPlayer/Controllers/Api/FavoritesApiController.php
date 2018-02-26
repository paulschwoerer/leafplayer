<?php

namespace App\LeafPlayer\Controllers\Api;

use App\LeafPlayer\Controllers\FavoritesController;
use App\LeafPlayer\Models\User;
use App\LeafPlayer\Utils\CommonValidations;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * This controller is the layer between the API and the FavoriteController.
 *
 * Class FavoritesApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class FavoritesApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new FavoritesController;
    }

    /**
     * Add a current user's favorite.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Favorites\UnknownTypeException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function addFavorites(Request $request) {
        $this->requirePermission('favorites.add');

        $this->validate($request, [
            'type' => 'required|in:album,artist,song,playlist',
            'ids' => 'required|array|min:1',
            'ids.*' => 'string'
        ]);

        $success = $this->controller->addFavorites(
            $request->input('type'),
            $request->input('ids')
        );

        return $this->response(compact('success'));
    }

    /**
     * Remove a current user's favorite.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Favorites\UnknownTypeException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function removeFavorites(Request $request) {
        $this->requirePermission('favorites.remove');

        $this->validate($request, [
            'type' => 'required|in:album,artist,song,playlist',
            'ids' => 'required|array|min:1',
            'ids.*' => 'string'
        ]);

        $success = $this->controller->removeFavorites(
            $request->input('type'),
            $request->input('ids')
        );

        return $this->response(compact('success'));
    }

    /**
     * Get a user's favorites.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function getFavorites(Request $request) {
        $this->requirePermission('favorites.view');

        $this->validate($request, CommonValidations::PAGINATION_PARAMS);

        $offset = (integer)$request->input('offset', 0);
        $take = (integer)$request->input('take', 20);

        $user = User::withCount(
            'favorite_artists',
            'favorite_albums',
            'favorite_songs',
            'favorite_playlists'
        )->find(Auth::user()->id);

        $artists = $this->controller->getFavoriteArtists($offset, $take);
        $playlists = $this->controller->getFavoritePlaylists($offset, $take);
        $albums = $this->controller->getFavoriteAlbums($offset, $take);
        $songs = $this->controller->getFavoriteSongs($offset, $take);

        $data = [
            'artists' => $this->createPagination($artists, $user->favorite_artists_count, $offset),
            'albums' => $this->createPagination($albums, $user->favorite_albums_count, $offset),
            'playlists' => $this->createPagination($playlists, $user->favorite_playlists_count, $offset),
            'songs' => $this->createPagination($songs, $user->favorite_songs_count, $offset),
        ];

        return $this->response($data);
    }
}
