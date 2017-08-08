<?php

namespace App\LeafPlayer\Exceptions\Auth;

use \App\LeafPlayer\Exceptions\NotFoundException;
 
class UserNotFoundException extends NotFoundException {
    public function __construct() {
        parent::__construct('auth.user_not_found');
    }
}
