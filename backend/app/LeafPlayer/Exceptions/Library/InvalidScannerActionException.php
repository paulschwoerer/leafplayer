<?php

namespace App\LeafPlayer\Exceptions\Library;

use App\LeafPlayer\Exceptions\InternalException;

class InvalidScannerActionException extends InternalException {
    public function __construct($action) {
        parent::__construct('library.invalid_action', compact('action'));
    }
}
