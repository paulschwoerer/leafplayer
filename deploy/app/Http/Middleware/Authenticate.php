<?php

namespace App\Http\Middleware;

use App\LeafPlayer\Exceptions\Auth\UnauthorizedException;
use Closure;
use Illuminate\Contracts\Auth\Factory as Auth;

class Authenticate {
    /**
     * The authentication guard factory instance.
     *
     * @var \Illuminate\Contracts\Auth\Factory
     */
    protected $auth;

    /**
     * Create a new middleware instance.
     *
     * @param  \Illuminate\Contracts\Auth\Factory $auth
     */
    public function __construct(Auth $auth) {
        $this->auth = $auth;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @param  string|null $guard
     * @return mixed
     * @throws UnauthorizedException
     */
    public function handle($request, Closure $next, $guard = null) {
        if ($this->auth->guard($guard)->guest()) {
            throw new UnauthorizedException;
        }

        return $next($request);
    }
}
