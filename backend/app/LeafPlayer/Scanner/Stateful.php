<?php

namespace App\LeafPlayer\Scanner;


abstract class Stateful {
    private $currentState = -1;

    protected function setState($state) {
        $this->currentState = $state;
    }

    public function getState() {
        return $this->currentState;
    }
}