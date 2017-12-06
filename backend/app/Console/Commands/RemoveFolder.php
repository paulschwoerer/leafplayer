<?php

namespace App\Console\Commands;

use App\LeafPlayer\Controllers\LibraryController;
use App\LeafPlayer\Models\Folder;
use Illuminate\Console\Command;

class RemoveFolder extends Command {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:folder:remove {id}';

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
        if (Folder::find($this->argument('id')) === null) {
            $this->info('This folder does not exist');
        }

        (new LibraryController)->removeFolder($this->argument('id'));

        $this->info('Folder removed.');
    }

}