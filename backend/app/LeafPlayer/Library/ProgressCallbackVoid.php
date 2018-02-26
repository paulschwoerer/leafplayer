<?php

namespace App\LeafPlayer\Library;

class ProgressCallbackVoid implements ProgressCallbackInterface {
    public function onProgress($libraryActor) {}

    public function onFinished($libraryActor) {}
}