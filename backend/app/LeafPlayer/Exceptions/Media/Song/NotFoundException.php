<?php

namespace App\LeafPlayer\Exceptions\Media\Song;

use App\LeafPlayer\Exceptions\NotFoundException as Base;
 
class NotFoundException extends Base {
    public function __construct($id) {
        parent::__construct('song.not_found', compact('id'));
    }
}
