<?php

namespace App\LeafPlayer\Scanner\Enum;

abstract class ScannerAction {
    const SCAN = 0;
    const CLEAN = 1;
    const PURGE = 2;
}