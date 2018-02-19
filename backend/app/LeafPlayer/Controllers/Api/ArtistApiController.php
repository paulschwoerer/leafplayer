<?php

namespace App\LeafPlayer\Controllers\Api;

use App\LeafPlayer\Models\Artist;
use \Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;
use App\LeafPlayer\Controllers\ArtistController;
use App\LeafPlayer\Utils\CommonValidations;

/**
 * This controller is the layer between the API and the ArtistController.
 *
 * Class ArtistApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class ArtistApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new ArtistController;
    }

    /**
     * Increase the view count on an artist by an amount or 1 by default.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse The artist in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Artist\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function increaseViews(Request $request, $id) {
        $this->requirePermission('artist.increase-views');

        $this->validate($request, [
            'amount' => 'numeric|min:1'
        ]);

        $artist = $this->controller->getArtist($id);

        $artist = $this->controller->increaseViews($artist, $request->input('amount', 1));

        return $this->response($artist);
    }

    /**
     * Get an artist in JSON format.
     *
     * @param $id
     * @return JsonResponse Artist in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\Artist\NotFoundException
     */
    public function getArtist($id) {
        $this->requirePermission('artist.get');

        $artist = $this->controller->getArtist($id, ['albums', 'songs']);

        $artist->makeVisible(['song_count', 'album_count', 'type', 'total_duration', 'song_ids', 'album_ids']);

        $albums = $artist->albums()
            ->with(['artist' => function($query) {
                $query->select('id', 'name');
            }, 'arts'])
            ->withCount('songs')
            ->get()
            ->makeVisible(['type', 'song_count', 'artist']);

        return $this->response($artist, $albums);
    }

    /**
     * Get artists, paginated.
     *
     * @param Request $request
     * @return JsonResponse Array of Artists in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function getArtists(Request $request) {
        $this->requirePermission('artist.query');

        $this->validate($request, CommonValidations::PAGINATION_PARAMS);

        $offset = (integer)$request->input('offset', 0);

        $artists = $this->controller->getArtists(
            $request->input('take', 200),
            $offset
        );

        $artists->makeVisible(['type', 'song_count', 'album_count']);

        return $this->paginatedResponse($artists, Artist::count(), $offset);
    }
}
