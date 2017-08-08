<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Exceptions\Favorites\NoViewPermissionException;
use App\LeafPlayer\Exceptions\Favorites\UnknownTypeException;
use App\LeafPlayer\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

/**
 * This controller houses all the methods to interact with Favorites.
 *
 * Class FavoritesController
 * @package App\LeafPlayer\Controllers
 */
class FavoritesController extends BaseController {
    /**
     * Add some favorites. They all have to be of the same type.
     *
     * @param $type
     * @param $ids
     * @return bool
     * @throws UnknownTypeException
     */
    public function addFavorites($type, $ids) {
        switch($type) {
            case 'album':
                Auth::user()->favoriteAlbums()->attach($ids);
                break;
            case 'artist':
                Auth::user()->favoriteArtists()->attach($ids);
                break;
            case 'song':
                Auth::user()->favoriteSongs()->attach($ids);
                break;
            case 'playlist':
                Auth::user()->favoritePlaylists()->attach($ids);
                break;
            default:
                throw new UnknownTypeException($type);
        }

        return true;
    }

    /**
     * Remove some favorites. They all have to be of the same type.
     *
     * @param $type
     * @param $ids
     * @return bool
     * @throws UnknownTypeException
     */
    public function removeFavorites($type, $ids) {
        switch($type) {
            case 'album':
                Auth::user()->favoriteAlbums()->detach($ids);
                break;
            case 'artist':
                Auth::user()->favoriteArtists()->detach($ids);
                break;
            case 'song':
                Auth::user()->favoriteSongs()->detach($ids);
                break;
            case 'playlist':
                Auth::user()->favoritePlaylists()->detach($ids);
                break;
            default:
                throw new UnknownTypeException($type);
        }

        return true;
    }

    /**
     * Get the currently authenticated user's favorite albums.
     *
     * @param $offset
     * @param $take
     * @return Collection
     */
    public function getFavoriteAlbums($offset, $take) {
        return Auth::user()->favoriteAlbums()->offset($offset)->take($take)->get();
    }

    /**
     * Get the currently authenticated user's favorite artists.
     *
     * @param $offset
     * @param $take
     * @return Collection
     */
    public function getFavoriteArtists($offset, $take) {
        return Auth::user()->favoriteArtists()->offset($offset)->take($take)->get();
    }

    /**
     * Get the currently authenticated user's favorite playlists.
     *
     * @param $offset
     * @param $take
     * @return Collection
     */
    public function getFavoritePlaylists($offset, $take) {
        return Auth::user()->favoritePlaylists()->offset($offset)->take($take)->get();
    }

    /**
     * Get the currently authenticated user's favorite songs.
     *
     * @param $offset
     * @param $take
     * @return Collection
     */
    public function getFavoriteSongs($offset, $take) {
        return Auth::user()->favoriteSongs()->offset($offset)->take($take)->get();
    }
}
