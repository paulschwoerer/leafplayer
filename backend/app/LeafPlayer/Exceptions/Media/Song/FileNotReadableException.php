<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use \App\LeafPlayer\Exceptions\InternalException;
 
class FileNotReadableException extends InternalException {
    public function __construct($id) {
        parent::__construct('song.file_not_readable', compact('id'));
    }
}
