<?php

namespace App\Console\Commands;

use App\LeafPlayer\Controllers\ScannerController;
use App\LeafPlayer\Models\Folder;
use App\LeafPlayer\Scanner\Scanner;
use Illuminate\Console\Command;

class ScannerAddFolder extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scanner:folder:add {path}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command adds a folder to scan for files.';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function fire() {
        (new ScannerController)->addFolder($this->argument('path'), true);

        $this->info('Folder added.');
    }
}