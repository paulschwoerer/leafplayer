<?php

namespace App\LeafPlayer\Exceptions\Library;

use \App\LeafPlayer\Exceptions\BadRequestException;
 
class InvalidFolderException extends BadRequestException {
    public function __construct() {
        parent::__construct('library.invalid_folder');
    }
}
