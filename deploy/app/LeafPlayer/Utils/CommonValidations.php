<?php

namespace App\LeafPlayer\Utils;


abstract class CommonValidations {
    const MODEL_ID = [
        'id' => 'required|string|size:8'
    ];

    const PAGINATION_PARAMS = [
        'offset' => 'numeric|min:0',
        'take' => 'numeric|min:1'
    ];

    const USER_AND_ROLES = [
        'id' => 'required|string',
        'roles' => 'array',
        'roles.*' => 'numeric'
    ];
}
