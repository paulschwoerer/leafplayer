<?php

namespace App\LeafPlayer\Models;

class Folder extends BaseModel {
    protected $table = 'folders';

    protected $visible = ['id', 'path', 'selected'];

    public $timestamps = true;
    
    protected $fillable = ['path', 'selected'];

    public function getSelectedAttribute($value) {
        return (bool)$value;
    }
}
