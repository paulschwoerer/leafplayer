<?php

namespace App\LeafPlayer\Exceptions\Media\User;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class IdTakenException extends BadRequestException {
    public function __construct($id) {
        parent::__construct('user.exists', compact('id'));
    }
}
