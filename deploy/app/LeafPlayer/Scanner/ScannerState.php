<?php

namespace App\LeafPlayer\Scanner;

abstract class ScannerState {
    const IDLE = 0;
    const FINISHED = 1;

    const SEARCHING = 2;
    const SCANNING = 3;
    const CLEANING = 4;
    const CLEARING = 5;
}