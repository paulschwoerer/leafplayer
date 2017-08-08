<?php

namespace App\LeafPlayer\Models;

class Album extends Media {
    protected $table = 'albums'; 
    
    protected $touches = ['artist'];

    protected $visible = ['id', 'name', 'year', 'arts', 'viewed', 'artist'];

    protected $appends = ['type', 'song_count', 'total_duration', 'song_ids'];

    /**
     * Relationship to the songs of the Album.
     *
     * @return mixed
     */
    public function songs() {
        return $this->hasMany(Song::class)->orderBy('track', 'ASC');
    }

    /**
     * Relationship to all users, that have this album in their favorites.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function favoritedBy() {
        return $this->morphToMany(User::class, 'favoritable');
    }

    /**
     * Relationship to the album artist of the Album.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function artist() {
        return $this->belongsTo(Artist::class, 'artist_id');
    }

    /**
     * Relationship to all arts associated with the Album.
     *
     * Eager load the following:
     * arts
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function arts() {
        return $this->belongsToMany(Art::class, 'albums_arts');
    }

    /**
     * Generate a type attribute on the model.
     *
     * @return string
     */
    public function getTypeAttribute() {
        return 'album';
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
     * Get the total duration of all songs in this album.
     *
     * @return integer
     */
    public function getTotalDurationAttribute() {
        return $this->songs()->sum('duration');
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

