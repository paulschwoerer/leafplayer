<?php

namespace App\LeafPlayer\Exceptions\Library;

use App\LeafPlayer\Exceptions\InternalException;

class NonReadableDirectoryException extends InternalException {
    public function __construct($path) {
        parent::__construct('library.non_readable_directory', compact('path'));
    }
}
