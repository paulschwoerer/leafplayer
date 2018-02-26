<?php

namespace App\LeafPlayer\Utils;

class Map {
    private $map = [];

    public function put($key, $value) {
        $this->map[$key] = $value;
    }

    public function get($key) {
        return $this->map[$key];
    }

    public function exists($key) {
        return array_key_exists($key, $this->map);
    }

    public function keysToArray() {
        return array_keys($this->map);
    }

    public function clear() {
        $this->map = [];
    }

    public function count() {
        return count($this->map);
    }
}