<?php

namespace App\LeafPlayer\Exceptions\Favorites;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class UnknownTypeException extends BadRequestException {
    public function __construct($type) {
        parent::__construct('favorites.unknown_type', compact('type'));
    }
}