<?php

namespace App\Console\Commands;

use App\LeafPlayer\Controllers\LibraryController;
use Illuminate\Console\Command;
use Symfony\Component\Console\Helper\Table;

class ListFolders extends Command {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:folder:list';

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
        $folders = (new LibraryController)->getAllFolders();

        $this->table(['ID', 'Path', 'Selected'], $folders->map(function($folder) {
            return [
                $folder->id,
                $folder->path,
                $folder->selected
            ];
        })->all());
    }

}