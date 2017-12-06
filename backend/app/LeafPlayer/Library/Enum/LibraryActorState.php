<?php

namespace App\LeafPlayer\Library\Enum;

abstract class LibraryActorState {
    const UNDEFINED = -1;
    const FINISHED = 0;
    const SEARCHING = 1;
    const PROCESSING = 2;
}