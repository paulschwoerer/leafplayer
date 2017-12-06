<?php

namespace App\LeafPlayer\Library;

use App\LeafPlayer\Exceptions\Library\ScanInProgressException;
use App\LeafPlayer\Library\Enum\ErrorSeverity;
use App\LeafPlayer\Library\Enum\LibraryActorState;
use App\LeafPlayer\Models\Folder;
use App\LeafPlayer\Models\Scan;
use Carbon\Carbon;
use Fuz\Component\SharedMemory\SharedMemory;
use Fuz\Component\SharedMemory\Storage\StorageFile;
use Illuminate\Support\Facades\Log;
use PDOException;

abstract class LibraryActor extends Stateful {
    /**
     * @var Carbon
     */
    private $startTime;

    /**
     * @var SharedMemory
     */
    private $sharedScanInfo;

    /**
     * @var string
     */
    protected $currentFile = '';

    /**
     * @var int
     */
    protected $fileCount = 0;

    /**
     * @var int
     */
    protected $processedFileCount = 0;

    /**
     * @var int
     */
    private $progressRefreshInterval;

    /**
     * @var int
     */
    private $lastProgressUpdate = 0;

    /**
     * @var ProgressCallbackInterface
     */
    private $progressCallback;

    /**
     * @var array
     */
    private $errors = [];

    public function __construct(ProgressCallbackInterface $progressCallback) {
        $this->progressCallback = $progressCallback;
        $this->sharedScanInfo = new SharedMemory(new StorageFile(self::getSyncFilePath()));

        $this->prepare();
    }

    /**
     * Returns the scan progress refresh interval configured in the scanner config
     *
     * @return int
     */
    public static function getConfiguredRefreshInterval() {
        $configRefresh = config('library.refresh_interval');

        return $configRefresh && is_integer($configRefresh) ? $configRefresh : 500;
    }

    /**
     * Get the path of the file used to sync the scanner state across processes
     *
     * @return string
     */
    public static function getSyncFilePath() {
        return base_path('storage/app/library-scan-info.sync');
    }

    /**
     * Get the time that elapsed since the start of the scan
     *
     * @return string
     */
    public function getElapsedTime() {
        return Carbon::now()->diff($this->startTime);
    }

    /**
     * Get the time that elapsed since the start of the scan in seconds
     *
     * @return int
     */
    public function getElapsedTimeSeconds() {
        return Carbon::now()->diffInSeconds($this->startTime);
    }

    /**
     * Get total file count
     *
     * @return int
     */
    public function getFileCount() {
        return $this->fileCount;
    }

    /**
     * Get count of files already processed
     *
     * @return int
     */
    public function getProcessedFileCount() {
        return $this->processedFileCount;
    }

    /**
     * Get the error count
     *
     * @return int
     */
    public function getErrorCount() {
        return count($this->errors);
    }

    /**
     * Get errors
     *
     * @return array
     */
    public function getErrors() {
        return $this->errors;
    }

    /**
     * Test if a scan is already in progress
     *
     * @return bool
     */
    public function scanInProgress() {
        return isset($this->sharedScanInfo->state) &&
            $this->sharedScanInfo->state !== LibraryActorState::FINISHED;
    }

    /**
     * Set the current state
     *
     * @param int $state
     */
    protected function setState($state) {
        $this->sharedScanInfo->state = $state;

        parent::setState($state);
    }

    /**
     * Execute the scan
     *
     * @return void
     */
    protected abstract function perform();

    /**
     * Get type of the current scan
     *
     * @return string
     */
    protected abstract function getType();

    /**
     * Get scan folder paths from database
     *
     * @return array
     */
    protected function getFolderPaths() {
        return Folder::where('selected', 1)->get()->map(function($item) {
            return $item->path;
        })->toArray();
    }

    /**
     * Add an error
     *
     * @param $code
     * @param $details
     * @param string $severity
     */
    protected function addError($code, $details, $severity = ErrorSeverity::WARN) {
        array_push($this->errors, [
            'severity' => $severity,
            'code' => $code,
            'details' => $details
        ]);
    }

    /**
     * Update the progress in a set interval
     */
    protected function updateProgress() {
        $time = round(microtime(true) * 1000);

        if (($time - $this->lastProgressUpdate) > ($this->progressRefreshInterval)) {
            $this->lastProgressUpdate = $time;

            $this->progressCallback->onProgress($this);
            $this->updateScanInfo();
        }
    }

    /**
     * Signal the base actor to start the process
     */
    protected function readyToPerform() {
        try {
            $this->perform();
        } catch (\Exception $e) {
            $this->handleException($e);
        }

        $this->finish();
    }

    /**
     * Prepare the scan
     */
    private function prepare() {
        $this->setExecutionTimeLimit();

        if ($this->scanInProgress()) {
            throw new ScanInProgressException;
        }

        $this->startTime = Carbon::now();

        $this->progressRefreshInterval = self::getConfiguredRefreshInterval();
    }

    /**
     * Finish the scan
     */
    private function finish() {
        $this->saveScanInformation(false);

        $this->setState(LibraryActorState::FINISHED);

        $this->progressCallback->onFinished($this);
    }

    /**
     * Updates the scan info in the sync file
     */
    private function updateScanInfo() {
        if (!isset($this->sharedScanInfo->type)) {
            $this->sharedScanInfo->type = $this->getType();
        }

        $this->sharedScanInfo->currentFile = $this->currentFile;
        $this->sharedScanInfo->totalFileCount = $this->fileCount;
        $this->sharedScanInfo->processedFileCount = $this->processedFileCount;
    }

    /**
     * Save information about the current scan into the database
     *
     * @param $aborted
     */
    private function saveScanInformation($aborted) {
        // FIXME: reflect changes in database
        $scan = Scan::create([
            'type' => $this->getType(),
            'aborted' => $aborted,
            'processed_file_count' => $this->getProcessedFileCount(),
            'file_count' => $this->getFileCount(),
            'duration' => $this->getElapsedTimeSeconds()
        ]);

        $scan->errors()->createMany($this->errors);
    }

    /**
     * Handle a possible exception, that is thrown while scanning
     *
     * @param \ErrorException|\Exception $exception
     * @throws \ErrorException
     */
    private function handleException(\Exception $exception) {
        $this->setState(LibraryActorState::FINISHED);

        if ($exception instanceof PDOException) {
            Log::error('[Scanner] A database error occurred');
        } else {
            Log::error('[Scanner] An unknown error occurred');
        }

        Log::error('Aborting scan');

        $this->saveScanInformation(true);

        throw $exception;
    }

    /**
     * Sets the execution time limit as specified in the scanner config file
     */
    private function setExecutionTimeLimit() {
        set_time_limit(config('library.time_limit'));
    }
}