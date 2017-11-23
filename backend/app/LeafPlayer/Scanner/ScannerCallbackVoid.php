<?php

namespace App\LeafPlayer\Scanner;


class ScannerCallbackVoid implements ScannerCallbackInterface {
    public function onProgress($scanner) {}

    public function onFinished($scanner) {}
}