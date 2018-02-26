<?php

namespace App\LeafPlayer\Exceptions\Library;

use \App\LeafPlayer\Exceptions\BadRequestException;
 
class FolderNotAddedException extends BadRequestException {
    public function __construct() {
        parent::__construct('library.folder_not_added');
    }
}
