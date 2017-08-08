<?php

namespace App\LeafPlayer\Models;

class ScanError extends BaseModel {
    protected $table = 'scan_errors';

    public $timestamps = false;

    protected $fillable = ['code', 'severity', 'details'];

    /**
     * Relation to the scan this error happened in.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function scan() {
        return $this->belongsTo(Scan::class);
    }
}

