<?php

namespace App\LeafPlayer\Models;

class Playlist extends Media {
    protected $table = 'playlists';

    protected $visible = ['id', 'name', 'description', 'created_at', 'updated_at'];

    protected $appends = ['type', 'is_private', 'song_count', 'total_duration', 'song_ids'];

    protected $fillable = [
        'id',
        'name',
        'description',
        'private'
    ];

    /**
     * Relationship to the User who owns the Playlist.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function owner() {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Relationship to the Items of this Playlist.
     *
     * @return mixed
     */
    public function items() {
        return $this->hasMany(PlaylistItem::class)->orderBy('index', 'asc');
    }

    /**
     * Relationship to all users, that have this playlist in their favorites.
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
        return 'playlist';
    }

    /**
     * Generate the isPrivate attribute.
     *
     * @return bool
     */
    public function getIsPrivateAttribute() {
        return (boolean)$this->private;
    }

    /**
     * Generate the song_count attribute.
     *
     * @return integer
     */
    public function getSongCountAttribute() {
        return $this->items_count;
    }

    /**
     * Get total duration of this playlist.
     *
     * @return mixed
     */
    public function getTotalDurationAttribute() {
        $songTable = Song::getTableName();
        return $this->items()->leftJoin($songTable, PlaylistItem::getTableName() . '.song_id', '=', $songTable . '.id')->sum($songTable . '.duration');
    }

    /**
     * Generate the song_ids attribute.
     *
     * @return mixed
     */
    public function getSongIdsAttribute() {
        return $this->items()->with('song')->get()->map(function($item) {
            return $item->song ? $item->song->id : null;
        });
    }
}
