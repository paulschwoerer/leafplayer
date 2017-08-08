<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Exceptions\Media\Album\NotFoundException;
use App\LeafPlayer\Models\Album;
use Illuminate\Support\Collection;

/**
 * This controller houses all the methods to interact with albums.
 *
 * Class AlbumController
 * @package App\LeafPlayer\Controllers
 */
class AlbumController extends BaseController {
    /**
     * Get suggested albums.
     *
     * @param $with
     * @return Collection
     */
    public function getSuggestedAlbums($with) {
        return Album::with($with)->withCount('songs')->inRandomOrder()->take(10)->get();
    }

    /**
     * Increase the view count on an album by an amount or 1 by default.
     *
     * @param $album
     * @param $amount
     * @return Album
     */
    public function increaseViews($album, $amount) {
        $album->viewed += $amount;
        $album->save();

        return $album;
    }

    /**
     * Get album.
     *
     * @param $id
     * @param array $with
     * @return Album
     * @throws NotFoundException
     */
    public function getAlbum($id, $with = []) {
        $album = Album::with($with)->withCount(['songs'])->find($id);

        if ($album == null) {
            throw new NotFoundException($id);
        }

        return $album;
    }

    /**
     * Get albums, paginated.
     *
     * @param $offset
     * @param $take
     * @param array $with
     * @return mixed
     */
    public function getAlbums($offset, $take, $with = []) {
        return Album::with($with)
            ->withCount('songs')
            ->orderBy('name')
            ->offset($offset)
            ->take($take)
            ->get();
    }
}
