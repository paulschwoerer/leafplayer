<?php

namespace App\LeafPlayer\Exceptions\Library;

use App\LeafPlayer\Exceptions\NotFoundException;
 
class FolderNotFoundException extends NotFoundException {
    public function __construct($id) {
        parent::__construct('library.folder_not_found', compact('id'));
    }
}
