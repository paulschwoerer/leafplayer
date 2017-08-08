<?php

namespace App\LeafPlayer\Exceptions\Media\Playlist;

use App\LeafPlayer\Exceptions\NotFoundException;
 
class ItemNotFoundException extends NotFoundException {
    public function __construct($id) {
        parent::__construct('playlist.item_not_found', compact('id'));
    }
}
