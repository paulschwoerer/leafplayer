<?php

namespace App\LeafPlayer\Scanner;


use App\LeafPlayer\Exceptions\Scanner\InvalidScannerActionException;
use App\LeafPlayer\Exceptions\Scanner\ScanInProgressException;
use App\LeafPlayer\Utils\Map;
use Exception;
use Fuz\Component\SharedMemory\SharedMemory;
use Fuz\Component\SharedMemory\Storage\StorageFile;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Art;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Models\File;
use App\LeafPlayer\Models\Folder;
use App\LeafPlayer\Models\Song;
use Illuminate\Support\Facades\DB;

class Scanner extends Stateful {
    private $scanInfo;

    private $currentFile = '';

    private $totalFiles = 0;

    private $scannedFiles = 0;

    private $fileModificationTimestamps;

    private $audioFiles;

    public function __construct($action) {
        $this->scanInfo = new SharedMemory(new StorageFile(self::getSyncFilePath()));

        if ($this->scanInProgress()) {
            throw new ScanInProgressException;
        }

        $this->performAction($action);
    }

    public static function getSyncFilePath() {
        return base_path('storage/app/scanner-info.sync');
    }

    protected function setState($state) {
        $this->scanInfo->state = $state;

        parent::setState($state);
    }

    private function performAction($action) {
        try {
            $this->setExecutionTimeLimit(); // TODO: dynamic?

            $this->updateScanInfo();

            switch($action) {
                case ScannerAction::SCAN:
                    $this->performScan();
                    break;
                case ScannerAction::CLEAN:
                    $this->performClean();
                    break;
                case ScannerAction::PURGE:
                    $this->performPurge();
                    break;
                default:
                    throw new InvalidScannerActionException($action);
            }

            $this->setState(ScannerState::FINISHED);
        } catch (Exception $exception) {
            $this->handleException($exception);
        }
    }

    private function performScan() {
        $this->setState(ScannerState::SCANNING);

        $startTime = microtime(true);

        $folderScanner = (new DirectoryScanner($this->getFolderPaths(), [
            FileExtension::JPG,
            FileExtension::JPEG
        ], [
            FileExtension::MP3
        ]))->startScan();

        $this->audioFiles = $folderScanner->getAudioFiles();

        $this->loadFileModificationTimestamps();

        foreach ($this->audioFiles->keysToArray() as $audioFile) {
            $this->processAudioFile($audioFile);
        }

        echo 'Time needed (ms): ' . ((microtime(true) - $startTime) * 1000) . PHP_EOL;
    }

    private function processAudioFile($filePath) {

//        DB::beginTransaction();

//        DB::commit();
    }

    private function loadFileModificationTimestamps() {
        $this->fileModificationTimestamps = new Map();

        DB::table(File::getTableName())->orderBy('last_modified')->chunk(1000, function ($files) {
            foreach($files as $file) {
                if ($this->audioFiles->exists($file->path)) {
                    $this->audioFiles->put($file->path,
                        // overwrite last modification date
                        [FileParams::SAVED_MODIFICATION_DATE => $file->last_modified] + $this->audioFiles->get($file->path)
                    );
                } // TODO: image files
            }
        }); // TODO: use
    }

    private function performClean() {
        $this->setState(ScannerState::CLEANING);
    }

    private function performPurge() {
        $this->setState(ScannerState::PURGING);
    }

    /**
     * Sets the execution time limit as specified in the scanner config file
     */
    private function setExecutionTimeLimit() {
        set_time_limit(config('scanner.time_limit'));
    }

    private function getFolderPaths() {
        return [
            'E:\test2'
        ]; // TODO

//        return Folder::where('selected', 1)->get()->map(function($item) {
//            return $item->path;
//        });
    }

    private function scanInProgress() {
        return isset($this->scanInfo->state) && $this->scanInfo->state !== ScannerState::FINISHED;
    }

    private function updateScanInfo() {
        $this->scanInfo->currentFile = $this->currentFile;
        $this->scanInfo->totalFiles = $this->totalFiles;
        $this->scanInfo->scannedFiles = $this->scannedFiles;
    }

    private function handleException(Exception $exception) {
        $this->setState(ScannerState::FINISHED);

        throw $exception;
    }
}