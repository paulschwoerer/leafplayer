<?php

namespace App\LeafPlayer\Exceptions\Auth;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class InvalidPasswordException extends BadRequestException {
    public function __construct() {
        parent::__construct('auth.invalid_password');
    }
}
