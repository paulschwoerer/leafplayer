<?php

namespace App\LeafPlayer\Exceptions\Media\User;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class SelfDeleteException extends BadRequestException {
    public function __construct() {
        parent::__construct('user.self_delete');
    }
}
