<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use App\LeafPlayer\Exceptions\InternalException;

class InvalidScannerActionException extends InternalException {
    public function __construct($action) {
        parent::__construct('scanner.invalid_action', compact('action'));
    }
}
