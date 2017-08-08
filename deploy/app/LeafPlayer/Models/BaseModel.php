<?php

namespace App\LeafPlayer\Models;

use App\LeafPlayer\Utils\Random;
use Illuminate\Database\Eloquent\Model;
use App\LeafPlayer\Exceptions\Model\ModelNotFoundException;


abstract class BaseModel extends Model {

    protected $primaryKey = 'id';

    public $incrementing = true;

    /**
     * Get the name of the table this model is associated with.
     *
     * @return string
     */
    public static function getTableName() {
        return (new static)->getTable();
    }

    /**
     * Override the default toArray method and transform all array keys to camelCase.
     *
     * @return array
     */
    public function toArray() {
        $data = parent::toArray();

        $camelCaseKeys = [];

        foreach($data as $key => $value) {
            $camelCaseKeys[camel_case($key)] = $value;
        }

        return $camelCaseKeys;
    }
}
