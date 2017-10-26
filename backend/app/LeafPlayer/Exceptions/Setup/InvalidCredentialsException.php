<?php

namespace App\LeafPlayer\Exceptions\Setup;

use App\LeafPlayer\Exceptions\InternalException;

class InvalidCredentialsException extends InternalException {
    public function __construct($user) {
        parent::__construct('setup.invalid_credentials', compact('user'));
    }
}
