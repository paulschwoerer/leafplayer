<?php

namespace App\LeafPlayer\Exceptions\Setup;

use App\LeafPlayer\Exceptions\InternalException;

class NoDatabaseConnection extends InternalException {
    public function __construct() {
        parent::__construct('database.no_connection');
    }
}
