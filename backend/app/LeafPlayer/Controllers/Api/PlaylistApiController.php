<?php

namespace App\LeafPlayer\Controllers\Api;

use App\LeafPlayer\Controllers\PlaylistController;
use App\LeafPlayer\Models\Playlist;
use Illuminate\Http\JsonResponse;
use \Illuminate\Http\Request;
use App\LeafPlayer\Utils\CommonValidations;

/**
 * This controller is the layer between the API and the PlaylistController.
 *
 * Class PlaylistApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class PlaylistApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new PlaylistController;
    }

    /**
     * Create a playlist.
     *
     * @param Request $request
     * @return JsonResponse Newly created playlist in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoEditPermissionException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function createPlaylist(Request $request) {
        $this->requirePermission('playlist.create');

        $this->validate($request, [
            'name' => 'required|string',
            'description' => 'nullable|string',
            'isPrivate' => 'boolean',
            'songs' => 'array',
            'songs.*' => 'string'
        ]);

        $playlist = $this->controller->createPlaylist(
            $request->input('name'),
            $request->input('description', ''),
            $request->input('isPrivate', true)
        );

        $playlist = $this->controller->addSongsToPlaylist(
            $playlist,
            $request->input('songs', [])
        );

        $playlist = Playlist::with(['owner' => function($query) {
            $query->select('id', 'name');
        }])->withCount('items')->find($playlist->id);

        $playlist->makeVisible(['song_count', 'type', 'owner']);

        return $this->response($playlist);
    }


    /**
     * Update playlist properties.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoEditPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoViewPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function updatePlaylistProperties(Request $request, $id) {
        $this->requirePermission('playlist.update');

        $this->validate($request, [
            'name' => 'string',
            'description' => 'nullable|string',
            'isPrivate' => 'boolean'
        ]);

        $playlist = $this->controller->updatePlaylistProperties(
            $id,
            $request->input('name', null),
            $request->input('description') === null ? '' : $request->input('description', null),
            $request->input('isPrivate', null)
        );

        $playlist = Playlist::with(['owner' => function($query) {
            $query->select('id', 'name');
        }])->withCount('items')->find($playlist->id);

        $playlist->makeVisible(['song_count', 'type', 'owner']);

        return $this->response($playlist);
    }

    /**
     * Get a playlist.
     *
     * @param $id
     * @return JsonResponse Playlist in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoViewPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NotFoundException
     */
    public function getPlaylist($id) {
        $this->requirePermission('playlist.get');

        $playlist = $this->controller->getPlaylist($id, ['owner', 'owner.roles']);

        $playlist->makeVisible(['type', 'song_count', 'isPrivate', 'owner_id', 'total_duration', 'song_ids']);

        $playlist->owner->makeVisible(['type', 'roles']);

        return $this->response($playlist, $playlist->owner);
    }

    /**
     * Add songs to the end of a playlist.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse Playlist in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoEditPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoViewPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function addSongsToPlaylist(Request $request, $id) {
        $this->requirePermission('playlist.add-songs');

        $this->validate($request, [
            'songs' => 'array',
            'songs.*' => 'string'
        ]);

        $playlist = $this->controller->getPlaylist($id);

        $playlist = $this->controller->addSongsToPlaylist(
            $playlist,
            $request->input('songs', [])
        );

        $playlist = Playlist::withCount('items')->find($playlist->id)->makeVisible(['song_count', 'type']);

        return $this->response($playlist);
    }

    /**
     * Query playlists based on different parameters.
     *
     * @param Request $request
     * @return JsonResponse Array of Playlists in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function getPlaylists(Request $request) {
        $this->requirePermission('playlist.query');

        $this->validate($request, array_merge(CommonValidations::PAGINATION_PARAMS));

        $offset = (integer)$request->input('offset', 0);

        $playlists = $this->controller->getPlaylists(
            $request->input('take', 50),
            $offset,
            ['owner' => function($query) {
                $query->select('id', 'name');
            }]
        );

        $playlists->makeVisible(['type', 'owner', 'song_count']);

        return $this->paginatedResponse($playlists, Playlist::count(), $offset);
    }

    /**
     * Remove the songs at the specified indexes from a playlist.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse Playlist in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoEditPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoViewPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     * @throws \Exception
     */
    public function removeIndexesFromPlaylist(Request $request, $id) {
        $this->requirePermission('playlist.remove-indexes');

        $this->validate($request, [
            'indexes' => 'required|array',
            'indexes.*' => 'numeric|min:0'
        ]);

        $playlist = $this->controller->getPlaylist($id);

        $playlist = $this->controller->removeIndexesFromPlaylist($playlist, $request->input('indexes'));

        $playlist = Playlist::withCount('items')->find($playlist->id)->makeVisible(['song_count', 'type']);

        return $this->response($playlist);
    }

    /**
     * Set the order of items in a playlist.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\InvalidOrderException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\ItemNotFoundException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoEditPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoViewPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function setPlaylistOrder(Request $request, $id) {
        $this->requirePermission('playlist.set-order');

        $this->validate($request, [
            'songs' => 'required|array',
            'songs.*' => 'string'
        ]);

        $playlist = $this->controller->getPlaylist($id);

        $success = $this->controller->setPlaylistOrder($playlist, $request->input('songs'));

        return $this->response(compact('success'));
    }

    /**
     * Delete a given playlist.
     *
     * @param $id
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoDeletePermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NoViewPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Playlist\NotFoundException
     * @throws \Exception
     */
    public function deletePlaylist($id) {
        $this->requirePermission('playlist.delete');

        $success = $this->controller->deletePlaylist($id);

        return $this->response(compact('success'));
    }
}
