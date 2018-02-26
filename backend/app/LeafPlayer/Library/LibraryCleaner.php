<?php

namespace App\LeafPlayer\Library;


use App\LeafPlayer\Library\Enum\LibraryActionType;
use App\LeafPlayer\Library\Enum\LibraryActorState;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Art;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Models\File;
use App\LeafPlayer\Models\Song;

// TODO: Add currentItem handling

class LibraryCleaner extends LibraryActor {
    /**
     * @var int
     */
    private $duplicateCount = 0;

    /**
     * @var int
     */
    private $notFoundCount = 0;

    /**
     * @var int
     */
    private $outOfLibraryCount = 0;

    /**
     * @var int
     */
    private $songsRemovedCount = 0;

    /**
     * @var int
     */
    private $albumsRemovedCount = 0;

    /**
     * @var int
     */
    private $artistsRemovedCount = 0;

    public function __construct(ProgressCallbackInterface $progressCallback) {
        parent::__construct($progressCallback);

        $this->readyToPerform();
    }

    /**
     * @return int
     */
    public function getOutOfLibraryCount() {
        return $this->outOfLibraryCount;
    }

    /**
     * @return int
     */
    public function getNotFoundCount() {
        return $this->notFoundCount;
    }

    /**
     * @return int
     */
    public function getDuplicateCount() {
        return $this->duplicateCount;
    }

    /**
     * @return int
     */
    public function getSongsRemovedCount() {
        return $this->songsRemovedCount;
    }

    /**
     * @return int
     */
    public function getAlbumsRemovedCount() {
        return $this->albumsRemovedCount;
    }

    /**
     * @return int
     */
    public function getArtistsRemovedCount() {
        return $this->artistsRemovedCount;
    }

    /**
     * Execute the scan
     *
     * @return void
     */
    protected function perform() {
        $this->setState(LibraryActorState::PROCESSING);

        // Total count of items (use File::count() instead of Song::count() as a song can have multiple files)
        $this->totalItemCount =
            File::count() +
            Artist::count() +
            Album::count() +
            Art::count();

        $this->cleanSongs();

        $this->cleanAlbums();

        $this->cleanArts();

        $this->cleanArtists();
    }

    /**
     * Get type of the current scan
     *
     * @return string
     */
    protected function getType() {
        return LibraryActionType::CLEAN;
    }

    private function cleanSongs() {
        $folderPaths = $this->getFolderPaths();
        $songs = Song::with(['files'])->get();

        foreach ($songs as $song) {
            $songFileCount = $song->files->count();
            $deletedFileCount = 0;

            foreach ($song->files as $file) {
                if (!file_exists($file->path)) {
                    $file->delete();
                    $deletedFileCount++;
                    $this->notFoundCount++;
                } else if (count($folderPaths) === 0) {
                    $file->delete();
                    $deletedFileCount++;
                    $this->outOfLibraryCount++;
                } else {
                    foreach ($folderPaths as $folderPath) {
                        if (!starts_with($file->path, $folderPath)) {
                            $file->delete();
                            $deletedFileCount++;
                            $this->outOfLibraryCount++;
                            break;
                        }
                    }
                }

                $this->processedItemCount++;
                $this->updateProgress();
            }

            // Delete song if all its attached files have been deleted
            if ($songFileCount === $deletedFileCount) {
                $song->delete();
                $this->songsRemovedCount++;
            }
        }
    }

    private function cleanAlbums() {
        $albums = Album::withCount('songs')->get();

        foreach ($albums as $album) {
            if ($album->songs_count === 0) {
                $album->delete();
                $this->albumsRemovedCount++;
            }

            $this->processedItemCount++;
            $this->updateProgress();
        }
    }

    private function cleanArts() {
        $arts = Art::withCount('albums')->get();
        $artworkFolder = Art::getArtworkFolder();

        foreach ($arts as $art) {
            if ($art->albums_count === 0) {
                unlink($artworkFolder . $art->file);

                $art->delete();
            }

            $this->processedItemCount++;
            $this->updateProgress();
        }
    }

    private function cleanArtists() {
        $artists = Artist::withCount('albums', 'songs')->get();

        foreach($artists as $artist) {
            if ($artist->albums_count === 0 && $artist->songs_count === 0) {
                $artist->delete();
                $this->artistsRemovedCount++;
            }

            $this->processedItemCount++;
            $this->updateProgress();
        }
    }
}