<?php

namespace App\Console\Commands;

use App\LeafPlayer\Library\LibraryActor;
use App\LeafPlayer\Library\LibraryCleaner;
use App\LeafPlayer\Library\ProgressCallbackInterface;
use App\LeafPlayer\Library\ProgressCallbackVoid;
use Illuminate\Console\Command;

class LibraryClean extends Command implements ProgressCallbackInterface {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:library:clean {--no-output}';

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

        $callback = $this->option('no-output') ? new ProgressCallbackVoid : $this;

        new LibraryCleaner($callback);
    }

    /**
     * @param LibraryActor $libraryActor
     * @return void
     */
    public function onProgress(LibraryActor $libraryActor) {
        // TODO: Implement onProgress() method.
    }

    /**
     * @param LibraryActor $libraryActor
     * @return void
     */
    public function onFinished(LibraryActor $libraryActor) {
        $this->info('');
        $this->info('');
        $this->info('##########################################');
        $this->info('#      Cleaning finished: Summary        #');
        $this->info('##########################################');
//        $this->table([], [
//            ['Files found', $libraryActor->getFileCount()],
//            ['Files processed', $libraryActor->getProcessedFileCount()],
//            ['Time needed', $libraryActor->getElapsedTime()->format('%Hh %Im %Ss')],
//            ['Songs/second', round($libraryActor->getFileCount() / ($libraryActor->getElapsedTimeSeconds() == 0 ? 1 : $libraryActor->getElapsedTimeSeconds()), 2)],
//            ['ms/Song', round(($libraryActor->getElapsedTimeSeconds() * 1000) / $libraryActor->getFileCount() == 0 ? 1 : $libraryActor->getFileCount(), 2)],
//            ['Errors and warnings', $libraryActor->getErrorCount()],
//            ['Memory usage', round(memory_get_peak_usage() / (1024 * 1024)) . 'MB']
//        ]);
        // TODO: Implement onFinished() method.

        $this->info('');
        $this->info('Cleaning finished with ' . $libraryActor->getErrorCount() . ' errors and warnings');
    }
}