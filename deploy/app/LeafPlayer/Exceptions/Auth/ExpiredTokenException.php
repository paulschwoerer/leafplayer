<?php

namespace App\LeafPlayer\Exceptions\Auth;

use \App\LeafPlayer\Exceptions\BadRequestException;
 
class ExpiredTokenException extends BadRequestException {
    public function __construct() {
        parent::__construct('auth.token_expired');
    }
}
