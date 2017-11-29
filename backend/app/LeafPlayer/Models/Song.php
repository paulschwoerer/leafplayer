<?php

namespace App\LeafPlayer\Models;

class Song extends Media {
    protected $table = 'songs';

    protected $visible = ['id', 'title', 'track', 'duration', 'artist', 'album', 'played', 'downloaded'];

    protected $appends = ['type'];
    
    protected $touches = ['album', 'artist'];

    /**
     * Relationship to the Artist this Song belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function artist() {
        return $this->belongsTo(Artist::class);
    }

    /**
     * Relationship to the Album this Song belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function album() {
        return $this->belongsTo(Album::class);
    }

    /**
     * Relationship to the associated file to this Song.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function files() {
        return $this->hasMany(File::class);
    }

    /**
     * Relationship to all users, that have this song in their favorites.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function favoritedBy() {
        return $this->morphToMany(User::class, 'favoritable');
    }

    /**
     * Generate a type attribute on the model.
     *
     * @return string
     */
    public function getTypeAttribute() {
        return 'song';
    }

    /**
     * @return File|null
     */
    public function getFirstAvailableFile() {
        foreach($this->files as $file) {
            if (file_exists($file->path) && is_readable($file->path)) {
                return $file;
            }
        }

        return null;
    }
}

