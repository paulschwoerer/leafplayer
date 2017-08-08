<?php

namespace App\LeafPlayer\Utils;

use Illuminate\Support\Collection as EloquentCollection;

class Collection {
    /**
     * Compare two collections against each other. Returns true if they contain the same items, otherwise false.
     *
     * @param $collectionA
     * @param $collectionB
     * @return bool
     */
    public static function areEqual(EloquentCollection $collectionA, EloquentCollection $collectionB) {
        if ($collectionA->count() != $collectionB->count()) {
            return false;
        }

        return $collectionA->every(function($value) use (&$collectionB) {
            return $collectionB->contains($value);
        });
    }
}
