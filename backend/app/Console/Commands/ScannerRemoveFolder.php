<?php

namespace App\Console\Commands;

use App\LeafPlayer\Controllers\ScannerController;
use Illuminate\Console\Command;

class ScannerRemoveFolder extends Command {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:scanner:folder:remove {id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command removes a folder.';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function fire() {
        (new ScannerController)->removeFolder($this->argument('id'));

        $this->info('Folder removed.');
    }

}