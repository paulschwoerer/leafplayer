<?php

namespace App\LeafPlayer\Models;

/**
 * This model represents a permission or a permission wildcard that a role can have.
 *
 * Class RolePermission
 * @package App\LeafPlayer\Models
 */
class RolePermission extends BaseModel {
    protected $table = 'role_permissions';

    public $timestamps = false;

    /**
     * Relation to the Role this permission belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function role() {
        return $this->belongsTo(Role::class);
    }
}
