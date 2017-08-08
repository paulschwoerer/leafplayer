<?php

namespace App\LeafPlayer\Models;

use App\LeafPlayer\Utils\Constants;
use App\LeafPlayer\Utils\Random;

class Art extends BaseModel {
    protected $table = 'arts';

    protected $appends = ['src'];

    protected $visible = ['id', 'src', 'md5'];

    protected $fillable = ['file', 'md5'];

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
        return url('/artwork') . '/' . $this->file;
    }

    /**
     * Generate a file name for an artwork.
     *
     * @return string
     */
    public static function generateFileName() {
        $name = '';

        do {
            $name = Random::getRandomString(28) . '.jpg';
        } while(file_exists(public_path() . Constants::ARTWORK_FOLDER . $name));

        return $name;
    }
}
