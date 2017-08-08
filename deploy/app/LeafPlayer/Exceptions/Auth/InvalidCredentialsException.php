<?php

namespace App\LeafPlayer\Exceptions\Auth;

use \App\LeafPlayer\Exceptions\UnauthorizedException;
 
class InvalidCredentialsException extends UnauthorizedException {
    public function __construct() {
        parent::__construct('auth.invalid_credentials');
    }
}
