<?php

namespace App\LeafPlayer\Models;

class Genre extends BaseModel {
    protected $table = 'genres';

    protected $visible = ['id', 'name'];

    protected $fillable = ['name'];
    
    public $timestamps = false;

    /**
     * Relationship to the songs, that have this genre.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function songs() {
        return $this->hasMany(Song::class, 'songs_genres');
    }
}

