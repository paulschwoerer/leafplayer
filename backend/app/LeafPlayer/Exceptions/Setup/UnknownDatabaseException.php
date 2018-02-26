<?php

namespace App\LeafPlayer\Exceptions\Setup;

use App\LeafPlayer\Exceptions\InternalException;
// TODO: deprecated
class UnknownDatabaseException extends InternalException {
    public function __construct($name) {
        parent::__construct('setup.unknown_database', compact('name'));
    }
}
