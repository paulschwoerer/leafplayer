<?php

namespace App\LeafPlayer\Exceptions\Auth;

use App\LeafPlayer\Exceptions\UnauthorizedException;
 
class WrongPasswordException extends UnauthorizedException {
    public function __construct() {
        parent::__construct('auth.wrong_password');
    }
}
