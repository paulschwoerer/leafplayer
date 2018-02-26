<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Exceptions\Media\Playlist\NoDeletePermissionException;
use App\LeafPlayer\Exceptions\Media\Playlist\NoEditPermissionException;
use App\LeafPlayer\Exceptions\Media\Playlist\NoViewPermissionException;
use App\LeafPlayer\Exceptions\Media\Playlist\InvalidOrderException;
use App\LeafPlayer\Exceptions\Media\Playlist\ItemNotFoundException;
use App\LeafPlayer\Exceptions\Media\Playlist\NotFoundException;
use \App\LeafPlayer\Models\Playlist;
use App\LeafPlayer\Models\PlaylistItem;
use \App\LeafPlayer\Models\Song;
use App\LeafPlayer\Utils\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * This controller houses all the methods to interact with playlists.
 *
 * Class PlaylistController
 * @package App\LeafPlayer\Controllers
 */
class PlaylistController extends BaseController {
    /**
     * Create a playlist.
     *
     * @param $name
     * @param $description
     * @param $private
     * @return mixed
     */
    public function createPlaylist($name, $description, $private) {
        $playlist = Auth::user()->playlists()->create([
            'id' => Playlist::generateID(),
            'name' => $name,
            'description' => $description,
            'private' => $private
        ]);

        return $playlist;
    }

    /**
     * Update playlist properties.
     *
     * @param $id
     * @param $name
     * @param $description
     * @param $private
     * @return Playlist
     * @throws NoEditPermissionException
     * @throws NoViewPermissionException
     * @throws NotFoundException
     */
    public function updatePlaylistProperties($id, $name, $description, $private) {
        $playlist = $this->getPlaylist($id);

        if (!$this->canCurrentUserEditPlaylist($playlist)) {
            throw new NoEditPermissionException;
        }

        $playlist->name = $name === null ? $playlist->name : $name;
        $playlist->description = $description === null ? $playlist->description : $description;
        $playlist->private = $private === null ? $playlist->private : $private;

        $playlist->save();

        return $playlist->fresh();
    }

    /**
     * Get a playlist.
     *
     * @param $id string The id of the playlist.
     * @param array $with
     * @return Playlist
     * @throws NoViewPermissionException
     * @throws NotFoundException
     */
    public function getPlaylist($id, $with = []) {
        $playlist = Playlist::with($with)->withCount('items')->find($id);

        if ($playlist === null) {
            throw new NotFoundException($id);
        }

        if (!$this->canCurrentUserViewPlaylist($playlist)) {
            throw new NoViewPermissionException;
        }

        return $playlist;
    }

    /**
     * Get songs from a given playlist.
     *
     * @param Playlist $playlist
     * @param integer $offset
     * @param integer $take
     * @param array $with
     * @return mixed
     */
    public function getPlaylistSongs(Playlist $playlist, $offset, $take, array $with = []) {
        return $playlist
            ->items()
            ->with($with)
            ->orderBy('index', 'ASC')
            ->offset($offset)
            ->take($take)
            ->get()
            ->map(function($item) {
                if ($item->song === null) {
                    return collect([
                        'availability' => false,
                        'title' => $item->title
                    ]);
                }

                return $item->song;
            });
    }

    /**
     * Add the given songs to a playlist. This method will ignore songs, that are not found.
     *
     * @param Playlist $playlist
     * @param array $songIds
     * @return Playlist
     * @throws NoEditPermissionException
     * @internal param $songs
     */
    public function addSongsToPlaylist(Playlist $playlist, array $songIds) {
        if (!$this->canCurrentUserEditPlaylist($playlist)) {
            throw new NoEditPermissionException;
        }

        $songs = Song::whereIn('id', $songIds)->get();

        if ($songs->isEmpty()) {
            return $playlist;
        }

        $songHashmap = $songs->mapWithKeys(function($song) {
            return [$song->id => $song];
        });

        $index = $playlist->items->count();

        foreach ($songIds as $songId) {
            $song = $songHashmap->get($songId);

            if ($song !== null) {
                $playlistItem = new PlaylistItem();
                $playlistItem->title = $song->title;
                $playlistItem->index = $index;
                $playlistItem->song_id = $songId;

                $playlist->items()->save($playlistItem);

                $index++;
            }
        }

        return $playlist->fresh();
    }

    /**
     * Set order of items in a playlist.
     *
     * // TODO: rework
     *
     * @param Playlist $playlist
     * @param $songIds
     * @return bool
     * @throws InvalidOrderException
     * @throws ItemNotFoundException
     * @throws NoEditPermissionException
     */
    public function setPlaylistOrder(Playlist $playlist, $songIds) {
        if (!$this->canCurrentUserEditPlaylist($playlist)) {
            throw new NoEditPermissionException;
        }

        $songIdsInPlaylist = $playlist->items()->select('song_id')->get()->map(function($item) {
            return $item->song_id;
        });

        if (!Collection::areEqual(collect($songIds), $songIdsInPlaylist)) {
            throw new InvalidOrderException;
        };

        DB::beginTransaction();

        $index = 0;

        foreach ($songIds as $songId) {
            PlaylistItem::where('song_id', $songId)->update(['index' => $index]);
            $index++;
        }

        DB::commit();

        return true;
    }

    /**
     * Query playlists based on different parameters.
     *
     * @param $take
     * @param $offset
     * @param array $with
     * @return mixed
     */
    public function getPlaylists($take, $offset, $with = []) {
        $currentUserId = Auth::user()->id;

        // only get public playlists or playlists of the currently authenticated user
        return Playlist::with($with)
            ->withCount('items')
            ->where('private', 0)
            ->orWhere('owner_id', $currentUserId)
            ->offset($offset)
            ->take($take)
            ->orderBy('name')
            ->get();
    }

    /**
     * Remove the specified indexes from a playlist.
     *
     * @param Playlist $playlist
     * @param $indexes
     * @return Playlist
     * @throws NoEditPermissionException
     * @throws \Exception
     */
    public function removeIndexesFromPlaylist(Playlist $playlist, $indexes) {
        if (!$this->canCurrentUserEditPlaylist($playlist)) {
            throw new NoEditPermissionException;
        }

        PlaylistItem::whereIn('index', $indexes)->delete();

        return $playlist->fresh();
    }

    /**
     * Delete a playlist.
     *
     * @param $id
     * @return bool|null
     * @throws NoDeletePermissionException
     * @throws NoViewPermissionException
     * @throws NotFoundException
     * @throws \Exception
     */
    public function deletePlaylist($id) {
        $playlist = $this->getPlaylist($id);

        if (!$this->canCurrentUserDeletePlaylist($playlist)) {
            throw new NoDeletePermissionException;
        }

        return $playlist->delete();
    }

    /**
     * Check if the current user can delete a given playlist.
     *
     * @param Playlist $playlist
     * @return bool
     */
    private function canCurrentUserDeletePlaylist(Playlist $playlist) {
        return $playlist->owner_id === Auth::user()->id;
    }

    /**
     * Check if the current user can edit a given playlist.
     *
     * @param Playlist $playlist
     * @return bool
     */
    private function canCurrentUserEditPlaylist(Playlist $playlist) {
        return $playlist->owner_id === Auth::user()->id;
    }

    /**
     * Check if the current user can view a given playlist.
     *
     * @param Playlist $playlist
     * @return bool
     */
    private function canCurrentUserViewPlaylist(Playlist $playlist) {
        return $this->canCurrentUserEditPlaylist($playlist) || $playlist->private === 0;
    }
}
