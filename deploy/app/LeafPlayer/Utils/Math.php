<?php

namespace App\LeafPlayer\Utils;

class Math {
    public static function clamp($value, $min, $max) {
        return max($min, min($max, $value));
    }
}