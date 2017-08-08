<?php

namespace App\LeafPlayer\Exceptions\Media\Playlist;

use App\LeafPlayer\Exceptions\UnauthorizedException;
 
class NoDeletePermissionException extends UnauthorizedException {
    public function __construct() {
        parent::__construct('playlist.no_delete_permission');
    }
}
