<?php

namespace App\LeafPlayer\Controllers\Api;

use App\LeafPlayer\Exceptions\Auth\NoPermissionException;
use App\LeafPlayer\Models\Album;
use \Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;
use App\LeafPlayer\Controllers\AlbumController;
use App\LeafPlayer\Utils\CommonValidations;

/**
 * This controller is the layer between the API and the AlbumController.
 *
 * Class AlbumApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class AlbumApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new AlbumController;
    }

    /**
     * Get suggested albums.
     *
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     */
    public function getSuggestedAlbums() {
        $this->requirePermission('album.suggestions');

        $albums = $this->controller->getSuggestedAlbums([
            'artist' => function($query) {
                $query->select('id', 'name');
            },
            'arts'
        ]);

        $albums->makeVisible(['type', 'song_count']);

        return $this->response($albums);
    }

    /**
     * Increase the view count on an album by an amount or 1 by default.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Album\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function increaseViews(Request $request, $id) {
        $this->requirePermission('album.increase-views');

        $this->validate($request, [
            'amount' => 'numeric|min:1'
        ]);

        $album = $this->controller->getAlbum($id);

        $album = $this->controller->increaseViews($album, $request->input('amount', 1));

        return $this->response($album);
    }

    /**
     * Get an album in JSON format.
     *
     * @param $id
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Album\NotFoundException
     */
    public function getAlbum($id) {
        $this->requirePermission('album.get');

        $album = $this->controller->getAlbum($id, ['arts', 'artist' => function($query) {
            $query->select('id', 'name');
        }]);

        $album->makeVisible(['type', 'song_count', 'total_duration', 'song_ids']);

        return $this->response($album);
    }

    /**
     * Get albums, paginated.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function getAlbums(Request $request) {
        $this->requirePermission('album.query');

        $this->validate($request, CommonValidations::PAGINATION_PARAMS);

        $offset = (integer)$request->input('offset', 0);

        $albums = $this->controller->getAlbums(
            $offset,
            $request->input('take', 50),
            ['artist' => function($query) {
                $query->select('id', 'name');
            }, 'arts']
        );

        $albums->makeVisible(['type', 'song_count']);

        return $this->paginatedResponse($albums, Album::count(), $offset);
    }

    /**
     * @param Request $request
     * @throws NoPermissionException
     */
    public function downloadAlbum(Request $request) {
        if (config('app.is_demo')) {
            throw new NoPermissionException('demo_mode');
        }

        // future ...
    }
}
