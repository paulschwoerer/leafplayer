<?php

namespace App\LeafPlayer\Scanner;


use App\LeafPlayer\Exceptions\Scanner\NonExistingDirectoryException;
use App\LeafPlayer\Exceptions\Scanner\NonReadableDirectoryException;
use App\LeafPlayer\Utils\Map;
use DirectoryIterator;

class DirectoryScanner {
    const FILE_READ_BUFFER = 4096;

    /**
     * @var int
     */
    private $maxScanDepth;

    /**
     * @var Map
     */
    private $imageFiles;
    /**
     * @var Map
     */
    private $audioFiles;

    /**
     * @var array
     */
    private $audioFileTypes = [];

    /**
     * @var array
     */
    private $imageFileTypes = [];

    /**
     * @var Map
     */
    private $fileSizeCache;

    /**
     * @var Map
     */
    private $folderFileNumbers;

    /**
     * Map to store directories, that were scanned already
     *
     * @var array
     */
    private $scannedDirectories = null;

    /**
     * An array of directories, that will be scanned by the directory scanner
     *
     * @var array
     */
    private $directories = [];

    /**
     * FolderScanner constructor.
     * @param array $directories
     * @param array $imageFileTypes
     * @param array $audioFileTypes
     * @param int $scanDepth The maximum scan depth, 0 means unlimited.
     */
    public function __construct($directories, $imageFileTypes, $audioFileTypes, $scanDepth = 4) {
        $this->scannedDirectories = new Map();
        $this->fileSizeCache = new Map();
        $this->audioFiles = new Map();
        $this->imageFiles = new Map();
        $this->folderFileNumbers = new Map();
        $this->maxScanDepth = $scanDepth;

        $this->audioFileTypes = $audioFileTypes;
        $this->imageFileTypes = $imageFileTypes;

        $this->setScanDirectories($directories);
    }

    /**
     * Start the directory scan. The results will be retrievable by calling the corresponding getters
     *
     * @param bool $clearFirst
     * @return $this
     */
    public function startScan($clearFirst = false) {
        if ($clearFirst === true) {
            $this->discardResults();
        }

        foreach ($this->directories as $directory) {
            $this->scanDirectory($directory);
        }

        $this->clearCache();

        return $this;
    }

    /**
     * Set the directories to scan
     *
     * Note: this method does not set any of the given directories,
     * if one of the directories can not be validated
     *
     * @param $directories
     * @return $this
     */
    public function setScanDirectories($directories) {
        $this->validateDirectories($directories);

        $this->directories = array_map(function ($directory) {
            return realpath($directory);
        }, $directories);

        return $this;
    }

    /**
     * @return array
     */
    public function getScanDirectories() {
        return $this->directories;
    }

    /**
     * @return Map
     */
    public function getImageFiles() {
        return $this->imageFiles;
    }

    /**
     * @return Map
     */
    public function getAudioFiles() {
        return $this->audioFiles;
    }

    /**
     * @param array $fileTypes
     * @return $this
     */
    public function setImageFileTypes($fileTypes) {
        $this->imageFileTypes = $fileTypes;

        return $this;
    }

    /**
     * @param array $fileTypes
     * @return $this
     */
    public function setAudioFileTypes($fileTypes) {
        $this->audioFileTypes = $fileTypes;

        return $this;
    }

    /**
     * @return array
     */
    public function getImageFileTypes() {
        return $this->imageFileTypes;
    }

    /**
     * @return array
     */
    public function getAudioFileTypes() {
        return $this->audioFileTypes;
    }

    /**
     * @param int $depth
     * @return $this
     */
    public function setMaxScanDepth($depth) {
        $this->maxScanDepth = $depth;

        return $this;
    }

    /**
     * @return int
     */
    public function getMaxScanDepth() {
        return $this->maxScanDepth;
    }

    /**
     * Discard results
     *
     * @return $this
     */
    public function discardResults() {
        $this->audioFiles->clear();
        $this->imageFiles->clear();

        return $this;
    }

    /**
     * Recursively scans directory until the maximum scan depth is reached
     *
     * @param string $directoryPath
     * @param int $depth
     */
    private function scanDirectory($directoryPath, $depth = 0) {
        if ($this->maxScanDepth !== 0 && $depth === $this->maxScanDepth) {
            return;
        }

        if (!$this->scannedDirectories->exists($directoryPath)) {
            $iterator = new DirectoryIterator($directoryPath);

            foreach($iterator as $item) {
                if ($item->isDot()) continue; // continue for . and ..

                if ($item->isDir() && $depth <= $this->maxScanDepth) {
                    $this->scanDirectory($item->getPathname(), $depth + 1);
                } else if($item->isFile()) {
                    $extension = $item->getExtension();

                    if (in_array($extension, $this->imageFileTypes)) {
                        $pathname = realpath($item->getPathname());

                        $this->imageFiles->put($pathname, [
                            FileInfoParams::SAVED_FILE => null
                        ]);
                    } else if (in_array($extension, $this->audioFileTypes)) {
                        $pathname = realpath($item->getPathname());

                        if (!$this->isDuplicate($pathname)) {
                            $folderFileNumber = 1;

                            if ($this->folderFileNumbers->exists($directoryPath)) {
                                $folderFileNumber = $this->folderFileNumbers->get($directoryPath) + 1;
                                $this->folderFileNumbers->put($directoryPath, $folderFileNumber);
                            } else {
                                $this->folderFileNumbers->put($directoryPath, 1);
                            }

                            $this->audioFiles->put($pathname, [
                                FileInfoParams::FOLDER_FILE_NUMBER => $folderFileNumber,
                                FileInfoParams::SAVED_FILE => null
                            ]);
                        }
                    }
                }
            }
        }
    }

    /**
     * Test if a file is a duplicate of a file, that was already found
     *
     * @param string $pathname
     * @return bool
     */
    private function isDuplicate($pathname) {
        $fileSize = filesize($pathname);

        if($this->fileSizeCache->exists($fileSize)) {
            $paths = $this->fileSizeCache->get($fileSize);

            foreach ($paths as $path) {
                if ($this->filesIdentical($pathname, $path)) {
                    return true;
                }
            }

            $this->fileSizeCache->put($fileSize, array_merge($this->fileSizeCache->get($fileSize), [$pathname]));
        } else {
            $this->fileSizeCache->put($fileSize, [$pathname]);
        }

        return false;
    }

    /**
     * Compare two files, by reading sequences from them until a mismatch is found
     * This is much faster (6x) than calculating MD5's (even with caching)
     *
     * @param $file1
     * @param $file2
     * @return bool
     */
    private function filesIdentical($file1, $file2) {
        if(!$filePointer1 = fopen($file1, 'rb')) {
            return false;
        }

        if(!$filePointer2 = fopen($file2, 'rb')) {
            fclose($filePointer1);
            return false;
        }

        $same = true;
        while (!feof($filePointer1) && !feof($filePointer2))
            if(fread($filePointer1, self::FILE_READ_BUFFER) !== fread($filePointer2, self::FILE_READ_BUFFER)) {
                $same = false;
                break;
            }

        if(feof($filePointer1) !== feof($filePointer2)) {
            $same = false;
        }

        fclose($filePointer1);
        fclose($filePointer2);

        return $same;
    }

    /**
     * Validate if directories in an array are existing and readable
     *
     * @param array $directories
     * @throws NonExistingDirectoryException
     * @throws NonReadableDirectoryException
     */
    private function validateDirectories($directories) {
        foreach ($directories as $directory) {
            if (!is_dir($directory)) {
                throw new NonExistingDirectoryException($directory);
            }

            if (!is_readable($directory)) {
                throw new NonReadableDirectoryException($directory);
            }
        }
    }

    /**
     * Clear the cache
     */
    private function clearCache() {
        $this->fileSizeCache->clear();
        $this->scannedDirectories->clear();
    }
}