<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use \App\LeafPlayer\Exceptions\BadRequestException;
 
class FolderNotAddedException extends BadRequestException {
    public function __construct() {
        parent::__construct('scanner.folder_not_added');
    }
}
