<?php

namespace App\LeafPlayer\Models;

class Role extends BaseModel {
    protected $table = 'roles';

    protected $visible = ['id', 'name', 'display_name'];
    
    public $timestamps = false;

    /**
     * Relationship to the users, that have this role assigned.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function users() {
        return $this->belongsToMany(User::class, 'users_roles');
    }

    /**
     * Relationship to the permissions this role has.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function rolePermissions() {
        return $this->hasMany(RolePermission::class);
    }

    /**
     * Check if role has a given permission.
     * Wildcards can be used.
     *
     * Eager load the following:
     * rolePermissions
     *
     * @param $name
     * @return bool
     */
    public function hasPermission($name) {
        foreach ($this->rolePermissions as $permission) {
            if (str_is($permission->permission, $name)) {
                return true;
            }
        }
        
        return false;
    }
}

