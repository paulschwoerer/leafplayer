<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;

/**
 * This is a middleware to automatically upgrade LeafPlayer if needed.
 *
 * Class UpdateMiddleware
 * @package App\Http\Middleware
 */
class UpdateMiddleware {
    public function handle($request, Closure $next) {
        // Run artisan upgrade automatically in production
        // This might make the first request to server take a bit longer
        if (config('app.needs_updating') && app()->environment('production')) {
            Artisan::call('migrate', ['--force' => true]);

            Config::set('app.needs_updating', false);
        }

        return $next($request);
    }
}
