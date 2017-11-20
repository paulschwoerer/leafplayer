<?php

namespace App\LeafPlayer\Scanner;

abstract class ScannerState {
    const FINISHED = 0;

    const SEARCHING = 1;
    const SCANNING = 2;
    const CLEANING = 3;
    const PURGING = 4;
}