<?php

namespace App\LeafPlayer\Exceptions\Media\Playlist;

use App\LeafPlayer\Exceptions\NotFoundException as Base;
 
class NotFoundException extends Base {
    public function __construct($id) {
        parent::__construct('playlist.not_found', compact('id'));
    }
}
