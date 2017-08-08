<?php

namespace App\LeafPlayer\Exceptions\Scanner;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class ScanInProgressException extends BadRequestException {
    public function __construct() {
        parent::__construct('scanner.scan_in_progress');
    }
}
