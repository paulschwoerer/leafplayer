<?php

namespace App\LeafPlayer\Exceptions\Media\Album;

use App\LeafPlayer\Exceptions\NotFoundException as Base;
 
class NotFoundException extends Base {
    public function __construct($id) {
        parent::__construct('album.not_found', compact('id'));
    }
}
