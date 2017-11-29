<?php

namespace App\Console\Commands;

use App\LeafPlayer\Scanner\Enum\ScannerAction;
use App\LeafPlayer\Scanner\Scanner;
use App\LeafPlayer\Scanner\ScannerCallbackVoid;
use Illuminate\Console\Command;

class ScannerPurge extends Command {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lp:scanner:purge {--confirm}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command deletes all media information from the database. Use with extreme care.';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function fire() {
        $confirmed = true;

        if (!$this->option('confirm')) {
            $confirmed = $this->confirm('Are you absolutely sure you want to purge the library?');
        }

        if ($confirmed) {
            $this->info('Purging library...');

            new Scanner(ScannerAction::PURGE, new ScannerCallbackVoid());
        } else {
            $this->info('You decided to abort. Phew, that was close!');
        }

        $this->info('Library purged.');
    }

}