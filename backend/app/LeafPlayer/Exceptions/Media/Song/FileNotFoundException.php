<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use \App\LeafPlayer\Exceptions\NotFoundException;
 
class FileNotFoundException extends NotFoundException {
    public function __construct($id) {
        parent::__construct('song.file_not_found', compact('id'));
    }
}
