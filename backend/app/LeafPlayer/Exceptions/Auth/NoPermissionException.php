<?php

namespace App\LeafPlayer\Exceptions\Auth;

use \App\LeafPlayer\Exceptions\ForbiddenException;
 
class NoPermissionException extends ForbiddenException {
    public function __construct($permission) {
        parent::__construct('auth.no_permission', compact('permission'));
    }
}
