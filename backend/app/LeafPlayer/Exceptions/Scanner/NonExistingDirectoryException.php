<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use App\LeafPlayer\Exceptions\InternalException;

class NonExistingDirectoryException extends InternalException {
    public function __construct($path) {
        parent::__construct('scanner.non_existing_directory', compact('path'));
    }
}
