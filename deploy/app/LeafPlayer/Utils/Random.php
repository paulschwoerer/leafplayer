<?php

namespace App\LeafPlayer\Utils;


class Random {

    /**
     * This function will generate a pseudo random string of characters with the given length.
     *
     * @param $length number The length of the string.
     * @return string
     */
    public static function getRandomString ($length) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';

        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, 61)];
        }

        return $randomString;
    }
}