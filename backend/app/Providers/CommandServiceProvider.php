<?php

namespace App\Providers;

use App\Console\Commands\Setup;
use App\Console\Commands\ScannerAddFolder;
use App\Console\Commands\ScannerClean;
use App\Console\Commands\ScannerListFolders;
use App\Console\Commands\ScannerRemoveFolder;
use App\Console\Commands\ScannerScan;
use Illuminate\Support\ServiceProvider;
use App\Console\Commands\ScannerPurge;
use App\Console\Commands\KeyGenerate;

class CommandServiceProvider extends ServiceProvider {

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register() {
        $this->app->singleton('command.scanner.clear', function() {
            return new ScannerPurge;
        });

        $this->app->singleton('command.scanner.scan', function() {
            return new ScannerScan;
        });

        $this->app->singleton('command.scanner.clean', function() {
            return new ScannerClean;
        });

        $this->app->singleton('command.scanner.folder.add', function() {
            return new ScannerAddFolder;
        });

        $this->app->singleton('command.scanner.folder.remove', function() {
            return new ScannerRemoveFolder;
        });

        $this->app->singleton('command.scanner.folder.list', function() {
            return new ScannerListFolders;
        });

        $this->app->singleton('command.key.generate', function() {
            return new KeyGenerate;
        });

        $this->app->singleton('command.lp.setup', function() {
            return new Setup;
        });

        $this->commands(
            'command.scanner.clear',
            'command.scanner.scan',
            'command.scanner.clean',
            'command.scanner.folder.add',
            'command.scanner.folder.remove',
            'command.scanner.folder.list',
            'command.key.generate',
            'command.lp.setup'
        );
    }
}
