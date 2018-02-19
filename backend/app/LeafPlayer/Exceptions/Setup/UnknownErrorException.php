<?php

namespace App\LeafPlayer\Exceptions\Setup;

use App\LeafPlayer\Exceptions\InternalException;
// TODO: deprecated
class UnknownErrorException extends InternalException {
    public function __construct() {
        parent::__construct('setup.unknown_error');
    }
}
