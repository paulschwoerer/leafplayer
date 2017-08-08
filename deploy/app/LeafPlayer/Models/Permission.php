<?php

namespace App\LeafPlayer\Models;

/**
 * This model represents an actual permission, that can be obtained by roles.
 *
 * Class RolePermission
 * @package App\LeafPlayer\Models
 */
class Permission extends BaseModel {
    protected $table = 'permissions';
    
    public $timestamps = false;
}