<?php

namespace App\LeafPlayer\Library;

use App\LeafPlayer\Library\Enum\ErrorCode;
use App\LeafPlayer\Library\Enum\ErrorSeverity;
use App\LeafPlayer\Library\Enum\FileExtension;
use App\LeafPlayer\Library\Enum\FileInfoParams;
use App\LeafPlayer\Library\Enum\LibraryActionType;
use App\LeafPlayer\Library\Enum\LibraryActorState;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Art;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Models\File;
use App\LeafPlayer\Models\Song;
use App\LeafPlayer\Utils\Map;
use Illuminate\Support\Facades\DB;
use PDOException;

class LibraryScanner extends LibraryActor {
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
    private $fileSongRelationCache;

    /**
     * @var Map
     */
    private $preparedFolderAlbumArts;

    /**
     * @var FileAnalyzer
     */
    private $fileAnalyzer;

    public function __construct(ProgressCallbackInterface $progressCallback) {
        parent::__construct($progressCallback);

        $this->fileAnalyzer = new FileAnalyzer();
        $this->artistCache = new Map();
        $this->albumCache = new Map();
        $this->fileSongRelationCache = new Map();

        $this->readyToPerform();
    }

    /**
     * Execute the scan
     *
     * @return void
     */
    protected function perform() {
        $this->setState(LibraryActorState::SEARCHING);

        $folderScanner = (new DirectoryScanner($this->getFolderPaths(), [
            FileExtension::JPG,
            FileExtension::JPEG
        ], [
            FileExtension::MP3
        ]))->startScan();

        $this->imageFiles = $folderScanner->getImageFiles();
        $this->audioFiles = $folderScanner->getAudioFiles();
        $this->totalItemCount = $this->audioFiles->count();

        $this->prepareFolderAlbumArts();

        $this->loadSavedFiles();

        $this->setState(LibraryActorState::PROCESSING);

        foreach ($this->audioFiles->keysToArray() as $audioFile) {
            $this->processAudioFile($audioFile);
            $this->processedItemCount++;

            $this->updateProgress();
        }
    }

    /**
     * Get type of the current scan
     *
     * @return string
     */
    protected function getType() {
        return LibraryActionType::SCAN;
    }

    /**
     * Process a single audio file
     *
     * @param string $filePath
     */
    private function processAudioFile($filePath) {
        $song = null;
        $file = null;

        $fileInfo = $this->audioFiles->get($filePath);

        $duplicate = $fileInfo[FileInfoParams::DUPLICATE];
        $savedFile = $fileInfo[FileInfoParams::SAVED_FILE];

        if ($savedFile === null) {
            $file = new File;
            $file->path = $filePath;
            $file->format = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            $file->last_modified = filemtime($filePath);

            if ($duplicate === null) {
                $song = new Song;
                $song->id = str_random(8);
                $file->song_id = $song->id;

                $this->fileSongRelationCache->put($filePath, $song->id);
            } else {
                $file->song_id = $this->fileSongRelationCache->get($duplicate);
                $file->save();

                return;
            }
        } else {
            if ($savedFile->last_modified === filemtime($filePath)) {
                return;
            }

            $song = $savedFile->song;

            $this->fileSongRelationCache->put($filePath, $song->id);
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

        $album = $this->createAlbum($albumArtist->id, $albumName, $albumYear, pathinfo($filePath, PATHINFO_DIRNAME));

        if (isset($analyzedFile['comments']['picture'])) {
            foreach($analyzedFile['comments']['picture'] as $picture) {
                $this->addAlbumArtFromTags($album, $picture['data']);
            }
        }

        $song->album_id = $album->id;
        $song->artist_id = $artist->id;

        try {
            $song->save();
        } catch (PDOException $exception) {
            $song->id = Song::generateID();
            $file->song_id = $song->id;
            $song->save();
        }

        $file->save();

        DB::commit();
    }

    /**
     * Create an artist
     *
     * @param string $name
     * @return Artist
     */
    private function createArtist($name) {
        $artist = null;

        if ($this->artistCache->exists($name)) {
            $artist = $this->artistCache->get($name);
        } else {
            $artists = Artist::where(['name' => $name])->get();

            if ($artists->isEmpty()) {
                $artist = new Artist;
                $artist->id = str_random(8);
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
     * @param $folder
     * @return Album
     */
    private function createAlbum($albumArtistId, $name, $year, $folder) {
        $album = null;

        $cacheKey = $albumArtistId . $name;

        if ($this->albumCache->exists($cacheKey)) {
            $album = $this->albumCache->get($cacheKey);
        } else {
            $albumQuery = Album::where(['name' => $name, 'artist_id' => $albumArtistId])->get();

            if ($albumQuery->isEmpty()) {
                $album = new Album;
                $album->id = str_random(8);
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

        if ($this->preparedFolderAlbumArts->exists($folder)) {
            foreach ($this->preparedFolderAlbumArts->get($folder) as $artFile) {
                $md5 = md5_file($artFile);
                $fileName = $md5 . '.' . FileExtension::JPG;
                $filePath = Art::getArtworkFolder() . $fileName;

                $artExists = file_exists($filePath);

                if (!$artExists) {
                    copy($artFile, $filePath);

                    $album->arts()->save(Art::create([
                        'file' => $fileName
                    ]));
                } else {
                    $album->arts()->syncWithoutDetaching([
                        Art::where('file', $fileName)->first()->id
                    ]);
                }
            }
        }

        return $album;
    }

    /**
     * Add album art from tags to an album
     *
     * @param Album $album
     * @param $imageData
     */
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
     * Load saved files from database and store into file maps to compare modification dates later
     *
     * @return void
     */
    private function loadSavedFiles() {
        $files = File::with('song')->get();

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
    }

    /**
     * Group album arts from image files by the directory they're located in
     *
     * @return void
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
}