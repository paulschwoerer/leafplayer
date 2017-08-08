<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Models\Song;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Models\Playlist;
use Illuminate\Support\Collection;

/**
 * This controller houses all the methods to interact with the media collection.
 *
 * Class CollectionController
 * @package App\LeafPlayer\Controllers
 */
class CollectionController extends BaseController {
    /**
     * Get statistics of the collection.
     *
     * @return Collection
     */
    public function getCollectionStatistics() {
        return collect([
            'albumCount' => Album::count(),
            'artistCount' => Artist::count(),
            'songCount' => Song::count(),
            'playlistCount' => Playlist::count()
        ]);
    }

    /**
     * Search the collection for the given string.
     *
     * @param $search
     * @return Collection
     */
    public function searchCollection($search) {
        $keyWords = explode(' ', $search);

        $results = new Collection;
        $results->put('artists', $this->searchArtists($search, $keyWords));
        $results->put('albums', $this->searchAlbums($search, $keyWords));
        $results->put('songs', $this->searchSongs($search, $keyWords));

        return $results;
    }

    private function searchArtists($search, $keyWords) {
        return Artist::withCount('albums', 'songs')
            ->where('name', 'LIKE', '%' . $search . '%')
            ->take(30)->get()
            ->makeVisible(['type', 'song_count', 'album_count']);
    }

    private function searchAlbums($search, $keyWords) {
        return Album::with(['arts', 'artist' => function($query) {
            $query->select('id', 'name');
        }])->withCount('songs')
            ->where('name', 'LIKE', '%' . $search . '%')
            ->take(30)->get()
            ->makeVisible(['type', 'song_count']);
    }

    private function searchSongs($search, $keyWords) {
        return Song::with([
            'album' => function ($query) {
                $query->select(['id', 'name']);
            },
            'artist' => function ($query) {
                $query->select(['id', 'name']);
            }
        ])->where('title', 'LIKE', '%' . $search . '%')
            ->take(30)->get()->makeVisible('type');
    }
}
