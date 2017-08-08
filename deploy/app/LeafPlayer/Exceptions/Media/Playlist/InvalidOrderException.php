<?php

namespace App\LeafPlayer\Exceptions\Media\Playlist;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class InvalidOrderException extends BadRequestException {
    public function __construct() {
        parent::__construct('playlist.invalid_order');
    }
}
