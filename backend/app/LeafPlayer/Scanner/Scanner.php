<?php

namespace App\LeafPlayer\Scanner;


use App\LeafPlayer\Exceptions\Scanner\InvalidScannerActionException;
use App\LeafPlayer\Exceptions\Scanner\ScanInProgressException;
use App\LeafPlayer\Models\Art;
use App\LeafPlayer\Models\Folder;
use App\LeafPlayer\Models\Scan;
use App\LeafPlayer\Models\ScanError;
use App\LeafPlayer\Utils\Map;
use App\LeafPlayer\Utils\Random;
use Carbon\Carbon;
use Fuz\Component\SharedMemory\SharedMemory;
use Fuz\Component\SharedMemory\Storage\StorageFile;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Models\File;
use App\LeafPlayer\Models\Song;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDOException;

class Scanner extends Stateful {
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
    private $currentFile = '';

    /**
     * @var int
     */
    private $totalAudioFiles = 0;

    /**
     * @var int
     */
    private $scannedAudioFiles = 0;

    /**
     * @var int
     */
    private $progressRefreshInterval;

    /**
     * @var int
     */
    private $lastProgressUpdate = 0;

    /**
     * @var Map
     */
    private $audioFiles;

    /**
     * @var Map
     */
    private $imageFiles;

    /**
     * @var Map
     */
    private $artistCache;

    /**
     * @var Map
     */
    private $albumCache;

    /**
     * @var Map
     */
    private $preparedFolderAlbumArts;

    /**
     * @var FileAnalyzer
     */
    private $fileAnalyzer;

    /**
     * @var ScannerCallbackInterface
     */
    private $scannerCallback;

    /**
     * @var array
     */
    private $errors = [];

    public function __construct($action, ScannerCallbackInterface $scannerCallback) {
        $this->sharedScanInfo = new SharedMemory(new StorageFile(self::getSyncFilePath()));

        if ($this->scanInProgress()) {
            throw new ScanInProgressException;
        }

        $this->scannerCallback = $scannerCallback;
        $this->startTime = Carbon::now();

        $this->progressRefreshInterval = self::getConfiguredRefreshInterval();

        try {
            $this->performAction($action);
        } catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * Returns the scan progress refresh interval configured in the scanner config
     *
     * @return int
     */
    public static function getConfiguredRefreshInterval() {
        $configRefresh = config('scanner.refresh_interval');

        return $configRefresh && is_integer($configRefresh) ? $configRefresh : 500;
    }

    /**
     * Get the path of the file used to sync the scanner state across processes
     *
     * @return string
     */
    public static function getSyncFilePath() {
        return base_path('storage/app/scanner-info.sync');
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
     * Get the time that elapsed since the start of the scan in seconds
     *
     * @return int
     */
    public function getElapsedTimeSeconds() {
        return Carbon::now()->diffInSeconds($this->startTime);
    }

    /**
     * Get the total file count of audio files
     *
     * @return int
     */
    public function getAudioFileCount() {
        return $this->totalAudioFiles;
    }

    /**
     * Get number of audio files, that were already scanned
     *
     * @return int
     */
    public function getScannedFileCount() {
        return $this->scannedAudioFiles;
    }

    /**
     * Set the current scanner state
     *
     * @param int $state
     */
    protected function setState($state) {
        $this->sharedScanInfo->state = $state;

        parent::setState($state);
    }

    /**
     * Perform scanner action
     *
     * @param int $action
     * @throws InvalidScannerActionException
     */
    private function performAction($action) {
        $this->setExecutionTimeLimit();

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

        $this->saveScanInformation(false);

        $this->setState(ScannerState::FINISHED);

        $this->scannerCallback->onFinished($this);
    }

    /**
     * Perform a scan
     */
    private function performScan() {
        $this->setState(ScannerState::SCANNING);

        $folderScanner = (new DirectoryScanner($this->getFolderPaths(), [
            FileExtension::JPG,
            FileExtension::JPEG
        ], [
            FileExtension::MP3
        ]))->startScan();

        $this->imageFiles = $folderScanner->getImageFiles();
        $this->audioFiles = $folderScanner->getAudioFiles();
        $this->totalAudioFiles = $this->audioFiles->count();

        $this->prepareFolderAlbumArts();

        $this->loadSavedFiles();

        // Create new file scanner instance to analyze files
        $this->fileAnalyzer = new FileAnalyzer();
        $this->artistCache = new Map();
        $this->albumCache = new Map();

        foreach ($this->audioFiles->keysToArray() as $audioFile) {
            $this->processAudioFile($audioFile);
            $this->scannedAudioFiles++;

            $this->updateProgress();
        }
    }

    /**
     * Process a single audio file
     *
     * @param string $filePath
     */
    private function processAudioFile($filePath) {
        $file = null;
        $fileInfo = $this->audioFiles->get($filePath);

        if ($fileInfo[FileInfoParams::SAVED_FILE] == null) {
            $file = new File;
            $file->path = $filePath;

            $song = new Song;
            $song->id = Random::getRandomString(8);
        } else {
            $file = $fileInfo[FileInfoParams::SAVED_FILE];

            if ($file->last_modified === filemtime($filePath)) {
                return;
            }

            $song = Song::where('file_id', $file->id)->get()->first();
        }

        $tags = [];
        $analyzedFile = $this->fileAnalyzer->analyze($filePath);

        if (array_key_exists('error', $analyzedFile)) {
            $this->addError(ErrorCode::CANNOT_PARSE_TAGS, $analyzedFile['error'][0] . ' (' . $filePath . ')', ErrorSeverity::WARN);
            return;
        }

        if (is_array($analyzedFile['tags'])) {
            if (array_key_exists('id3v2', $analyzedFile['tags'])) {
                $tags = $analyzedFile['tags']['id3v2'];
            } else {
                $this->addError(ErrorCode::UNSUPPORTED_TAGS, $filePath, ErrorSeverity::WARN);
            }
        }

        // extract title from tags
        $song->title = array_key_exists('title', $tags) ? $tags['title'][0] : pathinfo($filePath, PATHINFO_FILENAME);

        //extract track number from tags
        $folderFileNumber = $fileInfo[FileInfoParams::FOLDER_FILE_NUMBER];

        if (array_key_exists('track_number', $tags)) {
            preg_match('/\d+/', $tags['track_number'][0], $number);
            $song->track = (isset($number[0]) && intval($number[0]) !== 0) ? intval($number[0]) : $folderFileNumber;
        } else {
            $song->track = $folderFileNumber;
        }

        // TODO: handle genre

        // extract duration from file info
        $song->duration = $analyzedFile['playing_time'];

        // extract format from file info
        $file->format = strtolower($analyzedFile['format_name']);

        // store last modified date
        $file->last_modified = filemtime($filePath);

        // start database interaction
        DB::beginTransaction();

        // Manage the artist [artist] and albumArtist [band]
        $artistName = '[Unknown Artist]';
        $albumArtist = null;

        if (array_key_exists('artist', $tags)) {
            $artistName = $tags['artist'][0];
        }

        $artist = $this->createArtist($artistName);

        if (array_key_exists('band', $tags)) {
            if ($artistName != $tags['band'][0]) {
                $albumArtist = $this->createArtist($tags['band'][0]);
            } else {
                $albumArtist = $artist;
            }
        } else {
            $albumArtist = $artist;
        }

        // Manage the album
        $albumName = array_key_exists('album', $tags) ? $tags['album'][0] : '[Unknown Album]';
        $albumYear = array_key_exists('year', $tags) ? intval($tags['year'][0]) : 0;

        $album = $this->createAlbum($albumArtist->id, $albumName, $albumYear);

        if (isset($analyzedFile['comments']['picture'])) {
            foreach($analyzedFile['comments']['picture'] as $picture) {
                $this->addAlbumArtFromTags($album, $picture['data']);
            }
        }


        $file->save();
        $song->album_id = $album->id;
        $song->artist_id = $artist->id;
        $song->file_id = $file->id;

        try {
            $song->save();
        } catch (PDOException $exception) {
            $song->id = Song::generateID();
            $song->save();
        }

        DB::commit();
    }

    /**
     * Create an artist
     *
     * @param string $name
     * @return Artist|mixed|null
     */
    private function createArtist($name) {
        $artist = null;

        if ($this->artistCache->exists($name)) {
            $artist = $this->artistCache->get($name);
        } else {
            $artists = Artist::where(['name' => $name])->get();

            if ($artists->isEmpty()) {
                $artist = new Artist;
                $artist->id = Random::getRandomString(8);
                $artist->name = $name;

                try {
                    $artist->save();
                } catch (PDOException $exception) {
                    $artist->id = Artist::generateID();
                    $artist->save();
                }
            } else {
                $artist = $artists->first();
            }

            $this->artistCache->put($name, $artist);
        }

        return $artist;
    }

    /**
     * Create an album
     *
     * @param string $albumArtistId
     * @param string $name
     * @param int $year
     * @return Album|mixed|null
     */
    private function createAlbum($albumArtistId, $name, $year) {
        $album = null;

        $cacheKey = $albumArtistId . $name;

        if ($this->albumCache->exists($cacheKey)) {
            $album = $this->albumCache->get($cacheKey);
        } else {
            $albumQuery = Album::where(['name' => $name, 'artist_id' => $albumArtistId])->get();

            if ($albumQuery->isEmpty()) {
                $album = new Album;
                $album->id = Random::getRandomString(8);
                $album->name = $name;
                $album->artist_id = $albumArtistId;
                $album->year = $year;

                try {
                    $album->save();
                } catch (PDOException $exception) {
                    $album->id = Album::generateID();
                    $album->save();
                }
            } else {
                $album = $albumQuery->first();
            }

            $this->albumCache->put($cacheKey, $album);
        }

        return $album;
    }

    /**
     * Load saved files from database and store into file maps to compare modification dates later
     */
    private function loadSavedFiles() {
        File::chunk(1000, function ($files) {
            foreach($files as $file) {
                if ($this->audioFiles->exists($file->path)) {
                    $this->audioFiles->put($file->path,
                        [FileInfoParams::SAVED_FILE => $file] + $this->audioFiles->get($file->path)
                    );
                } else if ($this->imageFiles->exists($file->path)) {
                    $this->imageFiles->put($file->path,
                        [FileInfoParams::SAVED_FILE => $file] + $this->imageFiles->get($file->path)
                    );
                }
            }
        });
    }

    private function addAlbumArtFromTags(Album $album, $imageData) {
        $md5 = md5($imageData);
        $fileName = $md5 . '.' . FileExtension::JPG;
        $filePath = Art::getArtworkFolder() . $fileName;

        $artExists = file_exists($filePath);

        if (!$artExists) {
            file_put_contents($filePath, $imageData);

            $album->arts()->save(Art::create([
                'file' => $fileName
            ]));
        } else {
            $album->arts()->syncWithoutDetaching([
                Art::where('file', $fileName)->first()->id
            ]);
        }
    }

    /**
     * Group album arts from image files by the directory they're located in
     */
    private function prepareFolderAlbumArts() {
        $this->preparedFolderAlbumArts = new Map();

        foreach ($this->imageFiles->keysToArray() as $artPath) {
            $directory = pathinfo($artPath, PATHINFO_DIRNAME);

            if (!$this->preparedFolderAlbumArts->exists($directory)) {
                $this->preparedFolderAlbumArts->put($directory, [$artPath]);
            } else {
                $this->preparedFolderAlbumArts->put($directory, [$artPath] + $this->preparedFolderAlbumArts->get($directory));
            }
        }
    }

    /**
     * Clean the database from missing files or files, that are not included in the library anymore
     */
    private function performClean() {
        $this->setState(ScannerState::CLEANING);

        // TODO
    }

    /**
     * Purge the library
     */
    private function performPurge() {
        $this->setState(ScannerState::PURGING);

        DB::beginTransaction();

        DB::table(Artist::getTableName())->delete();
        DB::table(Album::getTableName())->delete();
        DB::table(Art::getTableName())->delete();
        DB::table(Song::getTableName())->delete();
        DB::table(File::getTableName())->delete();

        DB::commit();

        $albumArts = glob(Art::getArtworkFolder() . '*.' . FileExtension::JPG);

        foreach ($albumArts as $albumArt) {
            if (is_writable($albumArt)) {
                unlink($albumArt);
            }
        }

        // TODO
    }

    /**
     * Sets the execution time limit as specified in the scanner config file
     */
    private function setExecutionTimeLimit() {
        set_time_limit(config('scanner.time_limit'));
    }

    /**
     * Get folder paths from database
     *
     * @return array
     */
    private function getFolderPaths() {
        return Folder::where('selected', 1)->get()->map(function($item) {
            return $item->path;
        })->toArray();
    }

    /**
     * Test if a scan is already in progress
     *
     * @return bool
     */
    private function scanInProgress() {
        return isset($this->sharedScanInfo->state) && $this->sharedScanInfo->state !== ScannerState::FINISHED;
    }

    /**
     * Update the progress in a set interval
     */
    private function updateProgress() {
        $time = round(microtime(true) * 1000);

        if (($time - $this->lastProgressUpdate) > ($this->progressRefreshInterval)) {
            $this->lastProgressUpdate = $time;

            $this->scannerCallback->onProgress($this);
            $this->updateScanInfo();
        }
    }

    /**
     * Updates the scan info in the sync file
     */
    private function updateScanInfo() {
        $this->sharedScanInfo->currentFile = $this->currentFile;
        $this->sharedScanInfo->totalFiles = $this->totalAudioFiles;
        $this->sharedScanInfo->scannedFiles = $this->scannedAudioFiles;
    }

    /**
     * Add an error
     *
     * @param $code
     * @param $details
     * @param string $severity
     */
    private function addError($code, $details, $severity = ErrorSeverity::WARN) {
        array_push($this->errors, [
            'severity' => $severity,
            'code' => $code,
            'details' => $details
        ]);
    }

    /**
     * @param boolean $aborted
     */
    private function saveScanInformation($aborted) {
        $scan = Scan::create([
            'aborted' => $aborted,
            'scanned_files' => $this->getScannedFileCount(),
            'total_files' => $this->getAudioFileCount(),
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
        $this->setState(ScannerState::FINISHED);

        if ($exception instanceof PDOException) {
            Log::error('[Scanner] A database error occurred');
        } else {
            Log::error('[Scanner] An unknown error occurred');
        }

        Log::error('Aborting scan');

        $this->saveScanInformation(true);

        throw $exception;
    }
}