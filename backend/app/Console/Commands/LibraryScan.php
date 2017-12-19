<?php

namespace App\Console\Commands;

use App\LeafPlayer\Library\LibraryActor;
use App\LeafPlayer\Library\LibraryScanner;
use App\LeafPlayer\Library\ProgressCallbackInterface;
use App\LeafPlayer\Library\ProgressCallbackVoid;
use Illuminate\Console\Command;
use Symfony\Component\Console\Helper\ProgressBar;

class LibraryScan extends Command implements ProgressCallbackInterface {
    /**
     * @var ProgressBar
     */
    private $progressBar;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:library:scan {--no-output}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command starts a scan for media in the earlier specified folders.';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function fire() {
        $scannerCallback = $this->option('no-output') ? new ProgressCallbackVoid : $this;

        new LibraryScanner($scannerCallback);
    }

    /**
     * @param LibraryScanner $libraryActor
     */
    public function onProgress($libraryActor) {
        if ($this->progressBar === null) {
            $this->createProgressBar($libraryActor->getTotalItemCount());
        }

        $this->progressBar->setProgress($libraryActor->getProcessedItemCount());
    }

    /**
     * @param LibraryScanner $libraryActor
     */
    public function onFinished($libraryActor) {
        if ($this->progressBar === null) {
            $this->createProgressBar($libraryActor->getTotalItemCount());
        }

        $this->progressBar->finish();

        $fileCount = $libraryActor->getTotalItemCount();
        $secondsNeeded = $libraryActor->getElapsedTimeSeconds();

        $this->info('');
        $this->info('');
        $this->info('##########################################');
        $this->info('#        Scan finished: Summary          #');
        $this->info('##########################################');
        $this->table([], [
            ['Audiofiles found', $libraryActor->getTotalItemCount()],
            ['Audiofiles processed', $libraryActor->getProcessedItemCount()],
            ['Time needed', $libraryActor->getElapsedTime()->format('%Hh %Im %Ss')],
            ['Songs/second', round($fileCount / ($secondsNeeded === 0 ? 1 : $secondsNeeded), 2)],
            ['ms/Song', round(($secondsNeeded * 1000) / ($fileCount === 0 ? 1 : $fileCount), 2)],
            ['Errors and warnings', $libraryActor->getErrorCount()],
            ['Memory usage', round(memory_get_peak_usage() / (1024 * 1024)) . 'MB']
        ]);

        if ($libraryActor->getErrorCount() > 0 && $this->confirm('Show errors now?', true)) {
            $this->table(['Severity', 'Code', 'Details'], $libraryActor->getErrors());
        }

        $this->info('');
        $this->info('Scan finished with ' . $libraryActor->getErrorCount() . ' errors and warnings');
    }

    private function createProgressBar($max) {
        $this->progressBar = $this->output->createProgressBar($max);
        $this->progressBar->setRedrawFrequency(LibraryScanner::getConfiguredRefreshInterval() / 1000);
    }
}