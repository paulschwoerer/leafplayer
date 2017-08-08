<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Exceptions\Media\Artist\NotFoundException;
use App\LeafPlayer\Models\Album;
use \App\LeafPlayer\Models\Artist;
use Illuminate\Support\Collection;

/**
 * This controller houses all the methods to interact with artists.
 *
 * Class ArtistController
 * @package App\LeafPlayer\Controllers
 */
class ArtistController extends BaseController {
    /**
     * Increase the view count on an artist by an amount or 1 by default.
     *
     * @param $artist
     * @param $amount
     * @return Artist
     */
    public function increaseViews($artist, $amount) {
        $artist->viewed += $amount;
        $artist->save();

        return $artist;
    }

    /**
     * Get artist.
     *
     * @param $id
     * @param array $with
     * @return Artist
     * @throws NotFoundException
     */
    public function getArtist($id, $with = []) {
        $artist = Artist::with($with)->withCount('albums', 'songs')->find($id);

        if ($artist == null) {
            throw new NotFoundException($id);
        }

        return $artist;
    }

    /**
     * Get artists, paginated.
     *
     * @param $take
     * @param $offset
     * @param array $with
     * @return mixed
     */
    public function getArtists($take, $offset, $with = []) {
        return Artist::with($with)
            ->withCount('albums', 'songs')
            ->take($take)
            ->offset($offset)
            ->orderBy('name')
            ->get();
    }
}
