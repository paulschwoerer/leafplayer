<?php

namespace App\Console\Commands;


use App\LeafPlayer\Models\User;
use App\LeafPlayer\Setup\Wizard;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Console\Command;

class DevSetup extends Command {
    private $wizard;

    protected $signature = 'lp:dev-setup';

    protected $description = 'This command will do the development setup process.';

    public function __construct() {
        $this->wizard = new Wizard;

        parent::__construct();
    }

    public function fire() {
        if (!$this->wizard->envExists()) {
            $this->wizard->copyDevEnv();

            $this->wizard->generateSecrets();
        }

        if (!Schema::hasTable(User::getTableName())) {
            $this->wizard->migrateDatabase();

            Artisan::call('db:seed', ['--force' => true]);
        }

        $this->info("Successfully finished dev initialization");
    }
}