<?php

namespace App\LeafPlayer\Models;

class File extends BaseModel {

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'files';

    public $timestamps = false;

    protected $fillable = ['last_modified', 'path'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function song() {
        return $this->belongsTo(Song::class);
    }
}