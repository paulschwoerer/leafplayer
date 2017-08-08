<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use App\LeafPlayer\Exceptions\NotFoundException;
 
class FolderNotFoundException extends NotFoundException {
    public function __construct($id) {
        parent::__construct('scanner.folder_not_found', compact('id'));
    }
}
