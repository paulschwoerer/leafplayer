<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use App\LeafPlayer\Exceptions\InternalException;

class NonReadableDirectoryException extends InternalException {
    public function __construct($path) {
        parent::__construct('scanner.non_readable_directory', compact('path'));
    }
}
