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

    public function onProgress(LibraryActor $libraryActor) {
        if ($this->progressBar === null) {
            $this->createProgressBar($libraryActor->getFileCount());
        }

        $this->progressBar->setProgress($libraryActor->getProcessedFileCount());
    }

    public function onFinished(LibraryActor $libraryActor) {
        if ($this->progressBar === null) {
            $this->createProgressBar($libraryActor->getFileCount());
        }

        $this->progressBar->finish();

        $this->info('');
        $this->info('');
        $this->info('##########################################');
        $this->info('#        Scan finished: Summary          #');
        $this->info('##########################################');
        $this->table([], [
            ['Files found', $libraryActor->getFileCount()],
            ['Files processed', $libraryActor->getProcessedFileCount()],
            ['Time needed', $libraryActor->getElapsedTime()->format('%Hh %Im %Ss')],
            ['Songs/second', round($libraryActor->getFileCount() / ($libraryActor->getElapsedTimeSeconds() == 0 ? 1 : $libraryActor->getElapsedTimeSeconds()), 2)],
            ['ms/Song', round(($libraryActor->getElapsedTimeSeconds() * 1000) / $libraryActor->getFileCount() == 0 ? 1 : $libraryActor->getFileCount(), 2)],
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