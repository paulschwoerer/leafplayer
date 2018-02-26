<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {
    public function boot() {
        // Run artisan migrate automatically in production
        // This might make the first request to server take a bit longer
        if (config('app.needs_updating') && app()->environment('production')) {
            Artisan::call('migrate', ['--force' => true]);

            Config::set('app.needs_updating', false);
        }
    }
}
