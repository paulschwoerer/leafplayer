<?php

namespace App\LeafPlayer\Library;

class ProgressCallbackVoid implements ProgressCallbackInterface {
    public function onProgress(LibraryActor $libraryActor) {}

    public function onFinished(LibraryActor $libraryActor) {}
}