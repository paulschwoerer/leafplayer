<?php

namespace App\Console\Commands;

use App\LeafPlayer\Scanner\Scanner;
use Illuminate\Console\Command;

class ScannerClean extends Command {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:scanner:clean {--no-progress}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command cleans the database from missing files.';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function fire() {

        $this->info('Cleaning library...');

        $scanner = new Scanner($this->output);
        $scanner->setShowProgress(!$this->option('no-progress'));
        $scanner->cleanDatabase();

        $this->info('Library cleaned.');
    }

}