<?php

namespace App\LeafPlayer\Exceptions\Utility;

use App\LeafPlayer\Exceptions\InternalException;

class KeyNotFoundException extends InternalException {
    public function __construct($key) {
        parent::__construct('utility.key_not_found', $key);
    }
}
