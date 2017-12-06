<?php

namespace App\LeafPlayer\Exceptions\Library;

use App\LeafPlayer\Exceptions\BadRequestException;
 
class ScanInProgressException extends BadRequestException {
    public function __construct() {
        parent::__construct('library.scan_in_progress');
    }
}
