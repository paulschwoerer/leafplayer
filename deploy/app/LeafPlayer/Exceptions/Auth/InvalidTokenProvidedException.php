<?php

namespace App\LeafPlayer\Exceptions\Auth;

use \App\LeafPlayer\Exceptions\BadRequestException;
 
class InvalidTokenProvidedException extends BadRequestException {
    public function __construct() {
        parent::__construct('auth.invalid_token_provided');
    }
}
