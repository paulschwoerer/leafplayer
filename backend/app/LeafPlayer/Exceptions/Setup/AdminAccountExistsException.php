<?php

namespace App\LeafPlayer\Exceptions\Setup;

use App\LeafPlayer\Exceptions\BadRequestException;

class AdminAccountExistsException extends BadRequestException {
    public function __construct() {
        parent::__construct('setup.admin_account_exists');
    }
}
