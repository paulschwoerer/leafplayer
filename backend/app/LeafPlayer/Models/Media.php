<?php

namespace App\LeafPlayer\Models;

use App\LeafPlayer\Utils\Random;

// TODO: rename to something more generic as currently User extends from Media, which is a bit weird
abstract class Media extends BaseModel {
    public $timestamps = true;
    public $incrementing = false;

    /**
     * Generate a type attribute on the model.
     *
     * @return string
     */
    public abstract function getTypeAttribute();

    /**
     *   Generates a new ID for the model and checks if it already exists in the database.
     *
     *   @return string
     */
    public static function generateID() {
        do {
            $id = str_random(8);
        } while (self::find($id) != null);

        return $id;
    }
}
