<?php

namespace App\LeafPlayer\Exceptions\Media\User;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class InvalidUserIdException extends BadRequestException {
    public function __construct() {
        parent::__construct('user.invalid_id');
    }
}
