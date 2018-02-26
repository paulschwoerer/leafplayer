<?php

namespace App\LeafPlayer\Models;

class Art extends BaseModel {
    const ARTWORK_FOLDER = '/artwork/';

    protected $table = 'arts';

    protected $appends = ['src'];

    protected $visible = ['id', 'src'];

    protected $fillable = ['file'];

    /**
     * Relation to the albums this artwork is used in.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function albums() {
        return $this->belongsToMany(Album::class, 'albums_arts');
    }

    /**
     * Generate the src attribute.
     *
     * @return string
     */
    public function getSrcAttribute() {
        return url(self::ARTWORK_FOLDER) . '/' . $this->file;
    }

    /**
     * @return string
     */
    public static function getArtworkFolder() {
        return public_path() . self::ARTWORK_FOLDER;
    }
}
