<?php

namespace App\LeafPlayer\Exceptions\Setup;

use App\LeafPlayer\Exceptions\InternalException;

class UnknownDatabaseException extends InternalException {
    public function __construct($name) {
        parent::__construct('database.unknown_database', compact('name'));
    }
}
