<?php

namespace App\LeafPlayer\Exceptions\Media\Artist;

use App\LeafPlayer\Exceptions\NotFoundException as Base;
 
class NotFoundException extends Base {
    public function __construct($id) {
        parent::__construct('artist.not_found', compact('id'));
    }
}
