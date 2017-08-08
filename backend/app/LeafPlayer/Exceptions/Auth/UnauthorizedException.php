<?php

namespace App\LeafPlayer\Exceptions\Auth;

use App\LeafPlayer\Exceptions\UnauthorizedException as Base;
 
class UnauthorizedException extends Base {
    public function __construct() {
        parent::__construct('auth.unauthorized');
    }
}
