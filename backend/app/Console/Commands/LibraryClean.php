<?php

namespace App\Console\Commands;

use App\LeafPlayer\Library\LibraryActor;
use App\LeafPlayer\Library\LibraryCleaner;
use App\LeafPlayer\Library\ProgressCallbackInterface;
use App\LeafPlayer\Library\ProgressCallbackVoid;
use Illuminate\Console\Command;
use Symfony\Component\Console\Helper\ProgressBar;

class LibraryClean extends Command implements ProgressCallbackInterface {
    /**
     * @var ProgressBar
     */
    private $progressBar;

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
    protected $description = 'This command cleans the database from missing files and files, that are not included in the scan folders anymore.';

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
     * @param LibraryCleaner $libraryActor
     * @return void
     */
    public function onProgress($libraryActor) {
        if ($this->progressBar === null) {
            $this->createProgressBar($libraryActor->getTotalItemCount());
        }

        $this->progressBar->setProgress($libraryActor->getProcessedItemCount());
    }

    /**
     * @param LibraryCleaner $libraryActor
     * @return void
     */
    public function onFinished($libraryActor) {
        if ($this->progressBar === null) {
            $this->createProgressBar($libraryActor->getTotalItemCount());
        }

        $this->progressBar->finish();

        $this->info('');
        $this->info('');
        $this->info('##########################################');
        $this->info('#      Cleaning finished: Summary        #');
        $this->info('##########################################');
        $this->table([], [
            ['Files removed', $libraryActor->getNotFoundCount() + $libraryActor->getOutOfLibraryCount()],
            ['Songs removed', $libraryActor->getSongsRemovedCount()],
            ['Albums removed', $libraryActor->getAlbumsRemovedCount()],
            ['Artists removed', $libraryActor->getArtistsRemovedCount()],
            ['Time needed', $libraryActor->getElapsedTime()->format('%Hh %Im %Ss')],
            ['Errors and warnings', $libraryActor->getErrorCount()],
            ['Memory usage', round(memory_get_peak_usage() / (1024 * 1024)) . 'MB']
        ]);

        // TODO: error displaying

        $this->info('');
        $this->info('Cleaning finished with ' . $libraryActor->getErrorCount() . ' errors and warnings');
    }

    private function createProgressBar($max) {
        $this->progressBar = $this->output->createProgressBar($max);
        $this->progressBar->setRedrawFrequency(LibraryCleaner::getConfiguredRefreshInterval() / 1000);
    }
}