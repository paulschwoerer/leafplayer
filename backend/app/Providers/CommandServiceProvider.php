<?php

namespace App\Providers;

use App\Console\Commands\DevSetup;
use App\Console\Commands\Setup;
use App\Console\Commands\AddFolder;
use App\Console\Commands\LibraryClean;
use App\Console\Commands\ListFolders;
use App\Console\Commands\RemoveFolder;
use App\Console\Commands\LibraryScan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use App\Console\Commands\LibraryWipe;
use App\Console\Commands\KeyGenerate;

class CommandServiceProvider extends ServiceProvider {
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register() {
        $this->app->singleton('command.library.wipe', function() {
            return new LibraryWipe;
        });

        $this->app->singleton('command.library.scan', function() {
            return new LibraryScan;
        });

        $this->app->singleton('command.library.clean', function() {
            return new LibraryClean;
        });

        $this->app->singleton('command.folder.add', function() {
            return new AddFolder;
        });

        $this->app->singleton('command.folder.remove', function() {
            return new RemoveFolder;
        });

        $this->app->singleton('command.folder.list', function() {
            return new ListFolders;
        });

        $this->app->singleton('command.key.generate', function() {
            return new KeyGenerate;
        });

        $this->app->singleton('command.lp.setup', function() {
            return new Setup;
        });

        $this->app->singleton('command.lp.dev-setup', function() {
            return new DevSetup;
        });

        $this->commands(
            'command.library.wipe',
            'command.library.scan',
            'command.library.clean',
            'command.folder.add',
            'command.folder.remove',
            'command.folder.list',
            'command.key.generate',
            'command.lp.setup',
            'command.lp.dev-setup'
        );
    }
}
