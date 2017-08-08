<?php

namespace App\LeafPlayer\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PlaylistItem extends BaseModel {
    protected $table = 'playlist_items';

    protected $visible = ['id', 'title', 'song_id'];

    protected $fillable = ['id', 'index', 'title'];

    /**
     * Relationship to the Song that is wrapped by the Item.
     *
     * @return HasOne
     */
	public function song() {
        return $this->hasOne(Song::class, 'id', 'song_id');
    }

    /**
     * Relationship to the playlist this Item belongs to.
     *
     * @return BelongsTo
     */
    public function playlist() {
        return $this->belongsTo(Playlist::class);
    }
}

