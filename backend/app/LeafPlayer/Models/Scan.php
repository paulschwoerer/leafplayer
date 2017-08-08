<?php

namespace App\LeafPlayer\Models;

class Scan extends BaseModel {
    
    protected $table = 'scans';
    
    public $timestamps = true;

    protected $fillable = [
        'complete',
        'progress',
        'current_file',
        'scanned'
    ];

    /**
     * Relation to errors, that occurred during the scan.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function errors() {
        return $this->hasMany(ScanError::class);
    }
}

