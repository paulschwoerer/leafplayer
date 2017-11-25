<?php

namespace App\LeafPlayer\Utils;


class Security {
    /**
     * This method checks if a password is conform to the application's security standards.
     * // TODO: add some more elaborate testing
     *
     * @param $password
     * @return bool
     */
    static function checkPassword($password) {
        // This ensures, that the password matches all of the following criteria
        // - is at least 8 characters long
        // - contains at least one number
        // - contains at least one letter
        return strlen($password) >= 8
            && preg_match("#[0-9]+#", $password) > 0
            && preg_match("#[a-zA-Z]+#", $password) > 0;
    }

    /**
     * Test if a given user id i.e. username is valid.
     *
     * @param $id
     * @return bool
     */
    static function checkUserId($id) {
        // This ensures that the username is all of the following
        // - between 3 and 32 characters long
        // - contains only alphanumeric characters, dashes and underscores
        return preg_match('/^[A-Za-z0-9_-]{3,32}$/', $id);
    }
}