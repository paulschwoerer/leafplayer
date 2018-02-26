<?php

namespace App\LeafPlayer\Library;


use App\LeafPlayer\Library\Enum\LibraryActorState;

abstract class Stateful {
    private $currentState = LibraryActorState::UNDEFINED;

    protected function setState($state) {
        $this->currentState = $state;
    }

    public function getState() {
        return $this->currentState;
    }
}