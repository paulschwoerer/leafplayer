<?php

namespace App\Console\Commands;

use App\LeafPlayer\Scanner\Scanner;
use App\LeafPlayer\Scanner\ScannerAction;
use App\LeafPlayer\Scanner\ScannerCallbackInterface;
use App\LeafPlayer\Scanner\ScannerCallbackVoid;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Console\Helper\ProgressBar;

class ScannerScan extends Command implements ScannerCallbackInterface {
    /**
     * @var ProgressBar
     */
    private $progressBar;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:scanner:scan {--clean} {--no-output} {--update-existing}';

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
//        $clean = $this->option('clean');
//        $updateExisting = $this->option('update-existing');

        $scannerCallback = $this->option('no-output') ? new ScannerCallbackVoid : $this;

//        try {
            new Scanner(ScannerAction::SCAN, $scannerCallback);
//        } catch (\PDOException $exception) {
//            if (config('app.debug')) {
//                throw $exception;
//            }
//
//            Log::error('[Scanner] A database error was encountered');
//            $this->error('A database error was encountered');
//        }
    }

    public function onProgress($scanner) {
        if ($this->progressBar === null) {
            $this->createProgressBar($scanner->getAudioFileCount());
        }

        $this->progressBar->setProgress($scanner->getScannedFileCount());
    }

    public function onFinished($scanner) {
        if ($this->progressBar === null) {
            $this->createProgressBar($scanner->getAudioFileCount());
        }

        $this->progressBar->finish();

        $this->info('');
        $this->info('');
        $this->info('##########################################');
        $this->info('#        Scan finished: Summary          #');
        $this->info('##########################################');
        $this->table([], [
            ['Audio files found', $scanner->getAudioFileCount()],
            ['Audio files processed', $scanner->getScannedFileCount()],
            ['Time needed', $scanner->getElapsedTime()->format('%Hh %Im %Ss')],
            ['Songs/second', round($scanner->getAudioFileCount() / ($scanner->getElapsedTimeSeconds() == 0 ? 1 : $scanner->getElapsedTimeSeconds()), 2)],
            // ['Errors' => 'Errors and warnings: ' . $scanner->getErrorCount()]
        ]);
        $this->info('');
        $this->info('Scan finished');
    }

    private function createProgressBar($max) {
        $this->progressBar = $this->output->createProgressBar($max);
        $this->progressBar->setRedrawFrequency(Scanner::getConfiguredRefreshInterval() / 1000);
    }
}