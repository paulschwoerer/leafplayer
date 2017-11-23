<?php

namespace App\LeafPlayer\Scanner;

use App\LeafPlayer\Models\Art;
use App\LeafPlayer\Models\File;
use App\LeafPlayer\Models\Folder;
use App\LeafPlayer\Models\Playlist;
use App\LeafPlayer\Models\PlaylistItem;
use App\LeafPlayer\Models\Song;
use App\LeafPlayer\Models\Scan;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Utils\Constants;
use App\LeafPlayer\Models\ScanError;

use Exception;
use Carbon\Carbon;
use DirectoryIterator;
use Illuminate\Support\Facades\DB;
use Illuminate\Console\OutputStyle;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Console\Helper\ProgressBar;


class ScannerOld {

    /**
     * Should the Scanner show a progress bar?
     *
     * @var bool
     */
    private $showProgress = false;

    /**
     * Instance of filesystem to interact with local files.
     *
     * @var Filesystem
     */
    private $fileSystem;

    /**
     * A hash map of files to scan for.
     * It's implemented as a hash map to quickly check if a file has been already added.
     * The value of each entry will be true if the file already exists in the database.
     *
     * @var array
     */
    private $files = [];

    /**
     * A hash map of file numbers in a folder.
     *
     * @var array
     */
    private $folderFileNumbers = [];

    /**
     * This hash map stores all directories that have already been scanned, so there is no multiple scanning of directories.
     *
     * @var array
     */
    private $directoriesScanned = [];

    /**
     * Database representation of the current scan.
     *
     * @var Scan
     */
    private $scanInformation;

    /**
     * This is an array of all currently supported file extensions.
     *
     * @var array
     */
    private $supportedFileExtension = [
        FormatNames::MP3,
        FormatNames::JPG
    ];

    /**
     * The time at which the scan was started.
     *
     * @var Carbon
     */
    private $startTime;

    /**
     * A progress bar to visualize progress in the console.
     *
     * @var ProgressBar
     */
    private $progressBar;

    /**
     * An output stream to write messages to console.
     *
     * @var OutputStyle
     */
    private $outputStream;

    /**
     * The current state the scanner is in.
     *
     * @var int
     */
    private $currentState = ScannerState::IDLE;

    /**
     * Reference to FileInfo Wrapper for getid3 library.
     *
     * @var FileInfo
     */
    private $fileInfo;

    /**
     * This variable will store how many audio files have been analyzed by the scanner.
     *
     * @var int
     */
    private $audioFilesAnalyzed = 0;

    /**
     * This variable will store how many other files have been analyzed by the scanner. e.g. images
     *
     * @var int
     */
    private $otherFilesAnalyzed = 0;

    /**
     * Tells the scanner whether to update existing files or just look for new ones.
     *
     * @var bool
     */
    private $updateExisting = false;

    /**
     * Cached albums to limit database requests.
     *
     * @var array
     */
    private $cachedAlbums = [];

    /**
     * Cached artists to limit databse requests.
     *
     * @var array
     */
    private $cachedArtists = [];

    /**
     * Array to cache image files in folders to be used as Album Arts. Can store multiple images for the same directory.
     *
     * @var array
     */
    private $cachedArts = [];

    /**
     * Stores file name of file that is currently scanned.
     *
     * @var string
     */
    private $currentFileName = '';

    /**
     * Specifies the refresh interval for progress storage in database in seconds.
     *
     * @var int
     */
    private $progressRefreshInterval;

    /**
     * Stores when the scan information in the database was updated last.
     *
     * @var int
     */
    private $lastProgressUpdate = 0;

    /**
     * Scanner constructor.
     * @param OutputStyle $outputStream
     */
    public function __construct(OutputStyle $outputStream) {
        $this->startTime = Carbon::now();

        $configRefresh = config('scanner.refresh_interval');
        $this->progressRefreshInterval = $configRefresh ? $configRefresh : 1;
        $this->fileSystem = new Filesystem();
        $this->scanInformation = Scan::create();
        $this->outputStream = $outputStream;
        $this->fileInfo = new FileInfo;
    }

    /**
     * Starts an update on the Scanner, so it's looking for new Media.
     *
     * @param bool $clean
     * @param bool $updateExisting
     * @param bool $artFromFiles Currently not used.
     * @param bool $artFromTags Currently not used.
     */
    public function startScanning($clean, $updateExisting, $artFromFiles, $artFromTags) {
        set_time_limit(config('scanner.time_limit'));

        $this->updateExisting = $updateExisting;

        // Look for files
        $this->outputStream->text('Looking for files...');
        $this->setState(ScannerState::SEARCHING);
        $this->createProgressBar(0, 50);
        $this->constructFileArray();
        $this->getTimeStamps();
        $this->finishProgressBar();

        // Scan files
        $this->outputStream->text('Scanning files...');
        $this->setState(ScannerState::SCANNING);
        $this->createProgressBar($this->getTotalFileCount(), 50);
        $this->scanFiles();
        $this->finishProgressBar();

        // clean if requested
        if ($clean) {
            $this->setState(ScannerState::CLEANING);
            $this->cleanDatabase();
            $this->finishProgressBar();
        }

        $this->setState(ScannerState::FINISHED);
        $this->updateScanInformation(true);
    }

    /**
     * This method will clean the database from non existing songs.
     */
    public function cleanDatabase() {
        set_time_limit(config('scanner.time_limit'));

        $this->setState(ScannerState::CLEANING);

        $this->removeMissingFiles();

        $this->finishProgressBar();
        $this->setState(ScannerState::FINISHED);
        $this->updateScanInformation(true);
    }

    /**
     * Wipes the database from all media related data. Also gives the options to remove all playlist data.
     * Use this method with extreme care, as it renders all playlists and ratings useless.
     *
     * @param bool $deletePlaylists Not yet used.
     */
    public function clearDatabase($deletePlaylists) {
        set_time_limit(config('scanner.time_limit'));

        $this->setState(ScannerState::CLEARING);

        DB::beginTransaction();

        DB::table(Artist::getTableName())->delete();
        DB::table(Album::getTableName())->delete();
//        DB::table(Art::getTableName())->delete();
        DB::table(Song::getTableName())->delete();
        DB::table(File::getTableName())->delete();

        if ($deletePlaylists) {
            DB::table(Playlist::getTableName())->delete();
        }

        DB::commit();

        $paths = glob("*.jpg");

        foreach ($paths as $path) {
            if (pathinfo($path, PATHINFO_EXTENSION) == 'jpg') {
                if ($this->fileSystem->isWritable($path)) {
                    $this->fileSystem->remove($path);
                }
            }
        }

        $this->setState(ScannerState::FINISHED);
        $this->updateScanInformation(true);
    }

    /**
     * Set if the Scanner should display a progress bar.
     *
     * @param $value
     */
    public function setShowProgress($value) {
        $this->showProgress = $value;
    }

    /**
     * Get the time that elapsed since the start of the scan.
     *
     * @return string
     */
    public function getElapsedTime() {
        return Carbon::now()->diff($this->startTime);
    }

    /**
     * Get the time that elapsed since the start of the scan in seconds.
     *
     * @return int
     */
    public function getElapsedTimeInSeconds() {
        return Carbon::now()->diffInSeconds($this->startTime);
    }

    /**
     * Get the total number of errors that occurred during the scan.
     *
     * @return int
     */
    public function getErrorCount() {
        return ScanError::count();
    }

    /**
     * Get the total file count of scanned files.
     *
     * @return int
     */
    public function getTotalFileCount() {
        return count($this->files);
    }

    /**
     * Get the total amount of analyzed files.
     *
     * @return int
     */
    public function getAnalyzedFilesCount() {
        return $this->audioFilesAnalyzed + $this->otherFilesAnalyzed;
    }

    /**
     * Get the count of audio files analyzed.
     *
     * @return int
     */
    public function getAnalyzedAudioFilesCount() {
        return $this->audioFilesAnalyzed;
    }

    /**
     * Get the count of other files analyzed.
     *
     * @return int
     */
    public function getAnalyzedOtherFilesCount() {
        return $this->otherFilesAnalyzed;
    }

    /**
     * Remove missing files from database
     */
    private function removeMissingFiles() {
        $songs = Song::with('file')->get();

        $this->createProgressBar($songs->count() + Artist::count() + Album::count());

        // Clean songs
        foreach($songs as $song) {
            $path = $song->file->path;

            if (!file_exists($path) || !$this->fileSystem->isReadable($path)) {
                try {
                    DB::beginTransaction();

                    $song->file->delete();
                    $song->delete();

                    $this->currentFileName = pathinfo($path, PATHINFO_FILENAME);

                    DB::commit();
                } catch (Exception $e) {
                    $this->addError(ErrorCode::CANNOT_REMOVE_SONG, $song->filepath);
                }
            }

            $this->updateScanInformation();
            $this->updateProgressBar();
        }

        $albums = Album::withCount('songs')->get();

        // Clean albums
        foreach($albums as $album) {
            if ($album->songs_count === 0) {
                $album->delete();
            }
        }

        $artists = Artist::withCount('albums', 'songs')->get();

        // Clean artists
        foreach($artists as $artist) {
            if ($artist->albums_count === 0 && $artist->songs_count === 0) {
                $artist->delete();
            }
        }

        // TODO: clean arts

        $this->finishProgressBar();
    }

    /**
     * Set the current state of the Scanner.
     *
     * @param int $state
     */
    private function setState($state) {
        $this->currentState = $state;
    }

    /**
     * Load all timestamps from the database.
     */
    private function getTimeStamps() {
        File::chunk(1000, function ($files) {
            foreach($files as $file) {
                if (array_key_exists($file->path, $this->files)) {
                    $this->files[$file->path] = $file;
                }
            }
        });
    }

    /**
     * Start the actual tag scanning progress.
     */
    private function scanFiles() {
        foreach (array_keys($this->files) as $path) {
            $this->processFile($path);
        }
    }

    /**
     * Process a file and check for modification etc.
     *
     * @param string $path
     */
    private function processFile($path) {
        $format = pathinfo($path, PATHINFO_EXTENSION);

        $update = true;

        $file = $this->files[$path];

        // check if file was already added to the library
        if ($file != null) {
            // ignore file if the scanner is only looking for new files
            if (!$this->updateExisting) $update = false;

            // ignore if file has not been modified
            if ($file->last_modified == filemtime($path)) $update = false;
        }

        switch ($format) {
            case FormatNames::MP3:
                $folderPath = pathinfo($path, PATHINFO_DIRNAME);

                if (!array_key_exists($folderPath, $this->folderFileNumbers)) {
                    $this->folderFileNumbers[$folderPath] = 1;
                }

                if ($update) {
                    $this->processAudioFile($path, $file, $this->folderFileNumbers[$folderPath]);
                }

                $this->folderFileNumbers[$folderPath]++;
                $this->audioFilesAnalyzed++;
                break;
            case FormatNames::JPG:
                if ($update) {
                    $this->processImageFile($path, $file);
                }

                $this->otherFilesAnalyzed++;
                break;
            default:
                $this->addError(ErrorCode::UNSUPPORTED_FILE, $path . ($format), ErrorSeverity::INFO);
        }

        $this->updateProgressBar();
        $this->updateScanInformation();
    }

    /**
     * Process audio file.
     *
     * @param string $path
     * @param File|null $file
     * @param int $numberInFolder
     */
    private function processAudioFile($path, $file, $numberInFolder) {
        try {
            //DB::beginTransaction(); // TODO: Results in songs not being added to the database

            $song = null;

            if ($file == null) {
                $file = new File;
                $file->path = $path;

                $song = new Song;
                $song->id = Song::generateID();
            } else {
                $song = Song::where('file_id', $file->id)->get()->first();
            }

            $this->currentFileName = pathinfo($path, PATHINFO_FILENAME);

            // analyze file with getid3

            $fileInfo = $this->getFileInfo($path);


            if ($fileInfo == null) return;

            $tags = [];

            if (is_array($fileInfo['tags'])) {
                if (array_key_exists('id3v2', $fileInfo['tags'])) {
                    $tags = $fileInfo['tags']['id3v2'];
                }
            }

            // extract title from tags
            $song->title = array_key_exists('title', $tags) ? $tags['title'][0] : pathinfo($path, PATHINFO_FILENAME);

            //extract track number from tags
            if (array_key_exists('track_number', $tags)) {
                preg_match('/\d+/', $tags['track_number'][0], $number);
                $song->track = (isset($number[0]) && intval($number[0]) !== 0) ? intval($number[0]) : $numberInFolder;
            } else {
                $song->track = $numberInFolder;
            }

            // TODO: handle genre

            // extract duration from file info
            $song->duration = $fileInfo['playing_time'];

            // extract format from file info
            $file->format = strtolower($fileInfo['format_name']);

            // store last modified date
            $file->last_modified = filemtime($path);

            /*
             * Manage the artist [artist] and albumArtist [band]
             */
            $artistName = '[Unknown Artist]';
            $albumArtist = null;

            if (array_key_exists('artist', $tags)) {
                $artistName = $tags['artist'][0];
            }

            $artist = $this->addArtist($artistName);

            if (array_key_exists('band', $tags)) {
                if ($artistName != $tags['band'][0]) {
                    $albumArtist = $this->addArtist($tags['band'][0]);
                } else {
                    $albumArtist = $artist;
                }
            } else {
                $albumArtist = $artist;
            }

            $albumName = array_key_exists('album', $tags) ? $tags['album'][0] : '[Unknown Album]';
            $albumYear = array_key_exists('year', $tags) ? intval($tags['year'][0]) : 0;

            $album = $this->addAlbum($albumArtist->id, $albumName, $albumYear);

            // album arts from tags
            if (array_key_exists('comments', $fileInfo)) {
                if (is_array($fileInfo['comments'])) {
                    if (array_key_exists('picture', $fileInfo['comments'])) {
                        foreach($fileInfo['comments']['picture'] as $picture) {
                            $this->addArtToAlbum($album, true, $picture['data']);
                        }
                    }
                }
            }

            // TODO: rework art handling

            // album arts from files
            $baseName = pathinfo($path, PATHINFO_BASENAME);
            if (array_key_exists($baseName, $this->cachedArts)) {
                foreach ($this->cachedArts[$baseName] as $cachedArt) {
                    $this->addArtToAlbum($album, false, $cachedArt);
                }
            }

            $file->save();
            $song->album_id = $album->id;
            $song->artist_id = $artist->id;
            $song->file_id = $file->id;
            $song->save();

            //DB::commit();
        } catch(Exception $e) {
            $this->addError(ErrorCode::INTERNAL, $path, ErrorSeverity::ERROR);
        }
    }

    /**
     * Process image file.
     *
     * @param string $path
     * @param File|null $file
     */
    private function processImageFile($path, $file) {
        $baseName = pathinfo($path, PATHINFO_BASENAME);
        $art = null;

        if (!array_key_exists($baseName, $this->cachedArts)) {
            $this->cachedArts[$baseName] = [];
        }

        array_push($this->cachedArts[$baseName], $path);

        if ($file == null) {
            $file = new File;
            $file->path = $path;
            $file->format = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        }

        $file->last_modified = filemtime($path);
        $file->save();
    }

    /**
     * Add album art to album.
     *
     * @param Album $album The album, to which the art should be added.
     * @param bool $fromTags Determines whether $data is a file path or raw tag data.
     * @param string $data Can either be a file path or the raw image data from the tags.
     */
    private function addArtToAlbum($album, $fromTags, $data) {
        try {
            $md5 = md5($data);

            DB::beginTransaction();
            $query = Art::where('md5', $md5)->get();

            if ($query->isEmpty()) {
                $fileName = Art::generateFileName();
                if ($fromTags === true) {
                    $this->fileSystem->put(public_path() . Constants::ARTWORK_FOLDER . $fileName, $data);
                } else {
                    $this->fileSystem->copy($data, public_path() . Constants::ARTWORK_FOLDER . $fileName);
                }

                $album->arts()->save(Art::create([
                    'file' => $fileName,
                    'md5' => $md5
                ]));

            } else {
                if ($album->arts()->where('md5', $md5)->get()->isEmpty())
                    $album->arts()->save($query->first());
            }

            DB::commit();
        } catch (Exception $e) {
            $this->addError(ErrorCode::CANNOT_ADD_ART, $album->name);
        }
    }

    /**
     * Add an artist to the collection.
     *
     * @param string $name
     * @return Artist
     */
    private function addArtist($name) {
        $artist = null;

        if (isset($this->cachedArtists[$name])) {
            $artist = $this->cachedArtists[$name];
        } else {
            $artists = Artist::where(['name' => $name])->get();

            if ($artists->isEmpty()) {
                $artist = new Artist;
                $artist->id = Artist::generateID();
                $artist->name = $name;
                $artist->save();
            } else {
                $artist = $artists->first();
            }

            $this->cachedArtists[$name] = $artist;
        }

        return $artist;
    }

    /**
     * Add an album to the collection.
     *
     * @param string $albumArtistId
     * @param string $name
     * @param int $year
     * @return Album
     */
    private function addAlbum($albumArtistId, $name, $year) {
        $album = null;

        $cacheKey = $albumArtistId . $name;

        if (isset($this->cachedAlbums[$cacheKey])) {
            $album = $this->cachedAlbums[$cacheKey];
        } else {
            $albumQuery = Album::where(['name' => $name, 'artist_id' => $albumArtistId])->get();

            if ($albumQuery->isEmpty()) {
                $album = new Album;
                $album->id = Album::generateID();
                $album->name = $name;
                $album->artist_id = $albumArtistId;
                $album->year = $year;
                $album->save();
            } else {
                $album = $albumQuery->first();
            }

            $this->cachedAlbums[$cacheKey] = $album;
        }

        return $album;
    }

    /**
     * Get info from a file
     * @param $path
     * @return array|null
     */
    private function getFileInfo($path) {
        $fileInfo = $this->fileInfo->info($path);

        if (array_key_exists('error', $fileInfo)) {
            $this->outputStream->text('ADDING_ERROR');
            $this->addError(ErrorCode::CANNOT_GET_INFO, $path);
            return null;
        }

        return $fileInfo;
    }

    /**
     * Construct a file array with all files that should be scanned in the next step.
     */
    private function constructFileArray() {
        $folders = Folder::where('selected', 1)->get();

        foreach ($folders as $folder) {
            $this->scanDirectory($folder->path);
        }
    }

    /**
     * Recursively scans a directory for media and passes the found files on to be added to the files array.
     *
     * @param $path
     */
    private function scanDirectory($path) {
        try {
            if (!array_key_exists($path, $this->directoriesScanned)) {
                $this->directoriesScanned[$path] = true;

                if ($this->fileSystem->isDirectory($path)) {
                    if ($this->fileSystem->isReadable($path)) {
                        if (!$this->fileSystem->isWritable($path)) {
                            $this->addError(ErrorCode::DIRECTORY_NOT_WRITEABLE, $path);
                        }

                        $iterator = new DirectoryIterator($path);

                        foreach($iterator as $item) {
                            if ($item->isDot()) continue; // continue for . and ..

                            if ($item->isDir()) {
                                $this->scanDirectory($item->getPathname());
                            } else if($item->isFile()) {
                                $extension = $item->getExtension();

                                // ignore files with no extension or unsupported extension
                                if (empty($extension) || !in_array($extension, $this->supportedFileExtension)) continue;

                                $pathname = $item->getPathname();

                                // ignore files that were already added, so the same file is not scanned twice
                                if (array_key_exists($pathname, $this->files)) continue;

                                // check for readability and then add the file
                                if ($item->isReadable()) {
                                    if (!$item->isWritable()) {
                                        $this->addError(ErrorCode::FILE_NOT_WRITEABLE, $pathname);
                                    }

                                    // file seems to be all good, let's add it to the files array
                                    $this->files[$pathname] = null;

                                    $this->updateProgressBar();
                                    $this->updateScanInformation();
                                } else {
                                    $this->addError(ErrorCode::FILE_NOT_READABLE, $pathname);
                                }
                            }
                        }
                    } else {
                        $this->addError(ErrorCode::DIRECTORY_NOT_READABLE, $path);
                    }
                } else {
                    $this->addError(ErrorCode::DIRECTORY_DOES_NOT_EXIST, $path);
                }
            }
        } catch(Exception $e) {
            $this->addError(ErrorCode::INTERNAL, $path, ErrorSeverity::ERROR);
        }
    }

    /**
     * Add an error to the database.
     *
     * @param $code
     * @param $details
     * @param string $severity
     */
    private function addError($code, $details, $severity = ErrorSeverity::WARN) {
        $this->scanInformation->errors()->create([
            'code' => $code,
            'details' => $details,
            'severity' => $severity
        ]);
    }

    /**
     * Create a progress bar with the given format and total number of items for
     * visualization of the scan in the console.
     *
     * @param int $total
     * @param int $redrawFrequency
     * @param string $format
     */
    private function createProgressBar($total = 0, $redrawFrequency = 1, $format = '') {
        if (!$this->showProgress) return;

        $this->progressBar = $this->outputStream->createProgressBar($total);

        if ($format != '') {
            $this->progressBar->setFormat($format);
        }

        $this->progressBar->setRedrawFrequency($redrawFrequency);
    }

    /**
     * Update scan information in database.
     *
     * @param bool $ignoreInterval
     */
    private function updateScanInformation($ignoreInterval = false) {
        $time = round(microtime(true) * 1000); // get time in milliseconds

        if (($time - $this->lastProgressUpdate) > ($this->progressRefreshInterval / 1000) || $ignoreInterval) {
            $this->lastProgressUpdate = $time;

            $this->scanInformation->state = $this->currentState;
            $this->scanInformation->current_file = $this->currentFileName;
            $this->scanInformation->scanned_files = $this->getAnalyzedFilesCount();
            $this->scanInformation->total_files = $this->getTotalFileCount();
            $this->scanInformation->save();
        }
    }

    /**
     * Update the progress bar to reflect current progress.
     */
    private function updateProgressBar() {
        if (!$this->showProgress) return;

        $this->progressBar->advance();
    }

    /**
     * Finish the progress bar.
     */
    private function finishProgressBar() {
        if (!$this->showProgress) return;

        $this->progressBar->finish();
        $this->outputStream->text(PHP_EOL . PHP_EOL);
    }
}
