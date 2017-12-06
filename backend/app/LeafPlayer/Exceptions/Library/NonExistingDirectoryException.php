<?php

namespace App\LeafPlayer\Exceptions\Library;

use App\LeafPlayer\Exceptions\InternalException;

class NonExistingDirectoryException extends InternalException {
    public function __construct($path) {
        parent::__construct('library.non_existing_directory', compact('path'));
    }
}
