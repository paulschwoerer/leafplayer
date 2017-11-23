<?php

namespace App\LeafPlayer\Scanner;


interface ScannerCallbackInterface {
    /**
     * @param Scanner $scanner
     * @return void
     */
    public function onProgress($scanner);

    /**
     * @param Scanner $scanner
     * @return void
     */
    public function onFinished($scanner);
}