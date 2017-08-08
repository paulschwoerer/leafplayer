<?php

namespace App\LeafPlayer\Models;

class Artist extends Media {
    protected $table = 'artists';

    protected $visible = ['id', 'name', 'viewed'];

    protected $appends = ['type', 'song_count', 'album_count', 'total_duration', 'song_ids', 'album_ids'];

    /**
     * Relationship to all Albums this Artist is the album artist of.
     *
     * @return mixed
     */
    public function albums() {
        return $this->hasMany(Album::class)->orderBy('year', 'DESC');
    }

    /**
     * Relationship to all songs, this artist has produced.
     *
     * @return mixed
     */
    public function songs() {
        return $this->hasMany(Song::class)->orderBy('track', 'ASC');
    }

    /**
     * Relationship to all users, that have this artist in their favorites.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function favoritedBy() {
        return $this->morphToMany(User::class, 'favoritable');
    }

    /**
     * Generate the type attribute.
     *
     * @return string
     */
    public function getTypeAttribute() {
        return 'artist';
    }

    /**
     * Generate the song_count attribute.
     *
     * @return integer
     */
    public function getSongCountAttribute() {
        return $this->songs_count;
    }

    /**
     * Generate the album_count attribute.
     *
     * @return integer
     */
    public function getAlbumCountAttribute() {
        return $this->albums_count;
    }

    /**
     * Get the total duration of all songs from this artist.
     *
     * @return integer
     */
    public function getTotalDurationAttribute() {
        return $this->songs()->sum('duration');
    }

    /**
     * Generate the album_ids attribute.
     *
     * @return mixed
     */
    public function getAlbumIdsAttribute() {
        return $this->albums()->select('id')->get()->map(function($album) {
            return $album->id;
        });
    }

    /**
     * Generate the song_ids attribute.
     *
     * @return mixed
     */
    public function getSongIdsAttribute() {
        return $this->songs()->select('id')->get()->map(function($song) {
            return $song->id;
        });
    }
}

