<?php

namespace App\Console\Commands;

use App\LeafPlayer\Exceptions\LeafPlayerException;
use App\LeafPlayer\Setup\Wizard;
use Illuminate\Console\Command;

class Setup extends Command {
    protected $signature = 'lp:setup {--dev}';

    protected $description = 'This command will setup your LeafPlayer, asking you some important questions and getting things ready.';

    private $wizard;

    public function __construct() {
        $this->wizard = new Wizard;

        parent::__construct();
    }

    public function fire() {
        if ($this->wizard->envExists() && !$this->confirm('This installation seems to be setup already, repeating the setup will wipe all your settings and data. Proceed anyways?')) {
            $this->info('Setup cancelled');

            return;
        }

        $this->info('Copying configuration ...');
        $this->wizard->copyEnv($this->option('dev'));
        $this->info('Done.');
        $this->info('-------------------------------------------');

        $this->info('Generating secrets ...');
        $this->wizard->generateSecrets();
        $this->info('Done.');
        $this->info('-------------------------------------------');

        $this->info('Let\'s setup your database next.');
        $this->setupDatabase();
        $this->info('-------------------------------------------');

        $this->info('The only thing left now is an admin account.');
        $this->setupAdminAccount();
        $this->info('-------------------------------------------');

        $this->info('Your LeafPlayer installation was setup successfully, start listening!');
    }

    private function setupAdminAccount() {
        try {
            $this->wizard->createAdminAccount(
                $this->ask('Choose a username (min 3 characters, no whitespace)'),
                $this->ask('Choose a display name'),
                $this->secret('Choose a password (min 8 characters, a mix of numbers and letters is required)')
            );
        } catch (LeafPlayerException $e) {
            $this->warn($e->getMessage());
            return $this->setupAdminAccount();
        }

        return true;
    }

    private function setupDatabase() {
        try {
            $this->wizard->configureDatabase([
                'host' => $this->ask('Database server host', 'localhost'),
                'port' => $this->ask('Database server port', '3306'),
                'database' => $this->ask('Database name', 'leafplayer'),
                'user' => $this->ask('Database user'),
                'password' => $this->ask('Database password'),
            ]);
        } catch (LeafPlayerException $e) {
            $this->warn($e->getMessage());
            $this->info('Database setup not successful.');

            return $this->setupDatabase();
        }

        $this->info('Database setup successfully.');

        return true;
    }
}