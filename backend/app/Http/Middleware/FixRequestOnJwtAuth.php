<?php

namespace App\Http\Middleware;

use Closure;

/**
 * This is a workaround middleware to fix an issue with current version of JWT-Auth.
 * See https://github.com/tymondesigns/jwt-auth/issues/1269
 *
 * Class FixRequestOnJwtAuth
 * @package App\Http\Middleware
 */
class FixRequestOnJwtAuth {
    public function handle($request, Closure $next) {
        app('tymon.jwt.parser')->setRequest($request);

        return $next($request);
    }
}
