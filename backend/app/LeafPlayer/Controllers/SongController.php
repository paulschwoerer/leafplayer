<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Exceptions\Media\Song\NotFoundException;
use App\LeafPlayer\Models\Song;
use Illuminate\Support\Collection;

/**
 * This controller houses all methods to interact with songs.
 *
 * Class SongController
 * @package App\LeafPlayer\Controllers
 */
class SongController extends BaseController {
    /**
     * Get popular songs.
     *
     * @param $with
     * @return Collection
     */
    public function getPopularSongs($with) {
        return Song::with($with)->orderBy('played', 'DESC')->take(20)->get();
    }

    /**
     * Get a song
     *
     * @param $id string
     * @param array $with
     * @return Song
     * @throws NotFoundException
     */
    public function getSong($id, $with = []) {
        $song = Song::with($with)->find($id);

        if ($song == null) {
            throw new NotFoundException($id);
        }

        return $song;
    }


    /**
     * Get songs by their Ids.
     *
     * @param $songIds
     * @param array $with
     * @return mixed
     */
    public function getSongsById($songIds, $with = []) {
        return Song::with($with)
            ->whereIn('id', $songIds)->orderBy('title')->get();
    }
}
