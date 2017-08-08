<?php

namespace App\Console\Commands;

use App\LeafPlayer\Controllers\ScannerController;
use Illuminate\Console\Command;
use Symfony\Component\Console\Helper\Table;

class ScannerListFolders extends Command {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scanner:folder:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command lists all folders that are used for scanning.';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function fire() {
        $table = new Table($this->output);

        $folders = (new ScannerController)->getAllFolders();

        $table
            ->setHeaders(['ID', 'Path', 'Selected'])
            ->setRows($folders->map(function($folder) {
                return [
                    $folder->id,
                    $folder->path,
                    $folder->selected
                ];
            })->all());

        $table->render();
    }

}