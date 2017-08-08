<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use \App\LeafPlayer\Exceptions\BadRequestException;
 
class InvalidFolderException extends BadRequestException {
    public function __construct() {
        parent::__construct('scanner.invalid_folder');
    }
}
