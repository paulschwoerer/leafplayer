<?php

namespace App\Console\Commands;

use App\LeafPlayer\Library\LibraryWiper;
use App\LeafPlayer\Library\ProgressCallbackInterface;
use App\LeafPlayer\Library\ProgressCallbackVoid;
use Illuminate\Console\Command;

class LibraryWipe extends Command implements ProgressCallbackInterface {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:library:wipe {--no-output} {--confirm}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command wipes all media information from the database. Use with extreme care.';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function fire() {
        $confirmed = true;

        if (!$this->option('confirm')) {
            $confirmed = $this->confirm('Are you absolutely sure you want to wipe the library?');
        }

        if ($confirmed) {
            $this->info('Wiping library...');

            $callback = $this->option('no-output') ? new ProgressCallbackVoid : $this;

            new LibraryWiper($callback);
        } else {
            $this->info('You decided to abort. Phew, that was close!');
        }
    }

    /**
     * @param LibraryWiper $libraryActor
     * @return void
     */
    public function onProgress($libraryActor) {

    }

    /**
     * @param LibraryWiper $libraryActor
     * @return void
     */
    public function onFinished($libraryActor) {
        $this->info('Library wiped.');
    }
}