<?php

namespace App\Console\Commands;

use App\LeafPlayer\Scanner\Enum\ScannerAction;
use App\LeafPlayer\Scanner\Scanner;
use App\LeafPlayer\Scanner\ScannerCallbackInterface;
use App\LeafPlayer\Scanner\ScannerCallbackVoid;
use Illuminate\Console\Command;
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
    protected $signature = 'lp:scanner:scan {--no-output}';

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
        $scannerCallback = $this->option('no-output') ? new ScannerCallbackVoid : $this;

        new Scanner(ScannerAction::SCAN, $scannerCallback);
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
            ['ms/Song', round(($scanner->getElapsedTimeSeconds() * 1000) / $scanner->getAudioFileCount() == 0 ? 1 : $scanner->getAudioFileCount(), 2)],
            ['Errors and warnings', $scanner->getErrorCount()],
            ['Memory usage', round(memory_get_peak_usage() / (1024 * 1024)) . 'MB']
        ]);

        if ($scanner->getErrorCount() > 0 && $this->confirm('Show errors now?', true)) {
            $this->table(['Severity', 'Code', 'Details'], $scanner->getErrors());
        }

        $this->info('');
        $this->info('Scan finished with ' . $scanner->getErrorCount() . ' errors and warnings');
    }

    private function createProgressBar($max) {
        $this->progressBar = $this->output->createProgressBar($max);
        $this->progressBar->setRedrawFrequency(Scanner::getConfiguredRefreshInterval() / 1000);
    }
}