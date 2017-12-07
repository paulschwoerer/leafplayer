<?php

namespace App\LeafPlayer\Library;


interface ProgressCallbackInterface {
    /**
     * @param LibraryActor $libraryActor
     * @return void
     */
    public function onProgress($libraryActor);

    /**
     * @param LibraryActor $libraryActor
     * @return void
     */
    public function onFinished($libraryActor);
}