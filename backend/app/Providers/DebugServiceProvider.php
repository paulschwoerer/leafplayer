<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class DebugServiceProvider extends ServiceProvider {
    public function boot() {
        if (config('app.debug')) {
            DB::listen(function($query) {
                Log::debug('############################################');
                Log::debug('Executed database query:');
                Log::info($query->sql);
                Log::info($query->time . 'ms');
                Log::debug('############################################');
            });
        }
    }

    public function register() {
        //
    }
}
