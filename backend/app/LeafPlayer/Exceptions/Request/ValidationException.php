<?php

namespace App\LeafPlayer\Exceptions\Request;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class ValidationException extends BadRequestException {
    public function __construct($errors) {
        parent::__construct('request.validation');

        $this->details = $errors;
    }
}
