<?php

namespace App\Console\Commands;

use App\LeafPlayer\Scanner\Scanner;
use Illuminate\Console\Command;

class ScannerScan extends Command {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scanner:scan {--clean} {--no-progress} {--update-existing}';

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
        $clean = $this->option('clean');
        $updateExisting = $this->option('update-existing');

        $scanner = new Scanner($this->output);
        $scanner->setShowProgress(!$this->option('no-progress'));
        $scanner->startScanning($clean, $updateExisting, true, true);

        $this->info('##########################################');
        $this->info('                Summary                   ');
        $this->info('##########################################');
        $this->info('Files found: ' . $scanner->getTotalFileCount());
        $this->info('Audio files processed: ' . $scanner->getAnalyzedAudioFilesCount());
        $this->info('Other files processed: ' . $scanner->getAnalyzedOtherFilesCount());
        $this->info('Errors and warnings: ' . $scanner->getErrorCount());
        $this->info('Time needed: ' . $scanner->getElapsedTime()->format('%H:%I:%S'));
        $this->info('Songs per second: ' . $scanner->getTotalFileCount() / ($scanner->getElapsedTimeInSeconds() == 0 ? 1 : $scanner->getElapsedTimeInSeconds()));
        $this->info('');
        $this->info('Scan finished.');
    }

}