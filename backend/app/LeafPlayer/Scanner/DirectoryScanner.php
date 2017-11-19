<?php

namespace App\LeafPlayer\Scanner;


use App\LeafPlayer\Exceptions\Scanner\NonExistingDirectoryException;
use App\LeafPlayer\Exceptions\Scanner\NonReadableDirectoryException;
use App\LeafPlayer\Utils\Map;
use DirectoryIterator;

class DirectoryScanner {
    const FILE_READ_BUFFER = 4096;

    private $maxScanDepth;

    private $imageFiles = [];
    private $audioFiles = [];

    private $audioFileTypes;
    private $imageFileTypes;

    private $fileSizeCache;

    /**
     * Map to store directories, that were scanned already
     *
     * @var array
     */
    private $scannedDirectories = null;

    private $directories = [];

    /**
     * FolderScanner constructor.
     * @param $directories
     * @param $imageFileTypes
     * @param $audioFileTypes
     * @param int $scanDepth The maximum scan depth, 0 means unlimited.
     */
    public function __construct($directories, $imageFileTypes, $audioFileTypes, $scanDepth = 4) {
        $this->scannedDirectories = new Map();
        $this->fileSizeCache = new Map();
        $this->maxScanDepth = $scanDepth;

        $this->audioFileTypes = $audioFileTypes;
        $this->imageFileTypes = $imageFileTypes;

        $this->setScanDirectories($directories);
    }

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

    public function getScanDirectories() {
        return $this->directories;
    }

    public function getImageFiles() {
        return $this->imageFiles;
    }

    public function getAudioFiles() {
        return $this->audioFiles;
    }

    public function setImageFileTypes($fileTypes) {
        $this->imageFileTypes = $fileTypes;

        return $this;
    }

    public function setAudioFileTypes($fileTypes) {
        $this->audioFileTypes = $fileTypes;

        return $this;
    }

    public function getImageFileTypes() {
        return $this->imageFileTypes;
    }

    public function getAudioFileTypes() {
        return $this->audioFileTypes;
    }

    public function discardResults() {
        $this->audioFiles = [];
        $this->imageFiles = [];

        return $this;
    }

    public function setMaxScanDepth($depth) {
        $this->maxScanDepth = $depth;

        return $this;
    }

    public function getMaxScanDepth() {
        return $this->maxScanDepth;
    }

    /**
     * Recursively scans directory until the maximum scan depth is reached
     *
     * @param $directoryPath
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

                        if ($item->isReadable()) {
                            array_push($this->imageFiles, $pathname);
                        }
                    } else if (in_array($extension, $this->audioFileTypes)) {
                        $pathname = realpath($item->getPathname());

                        if ($item->isReadable() && $item->isWritable() && !$this->isDuplicate($this->audioFiles, $pathname)) {
                            array_push($this->audioFiles, $pathname);
                        }
                    }
                }
            }
        }
    }

    private function isDuplicate(&$files, $pathname) {
        $fileSize = filesize($pathname);
        $nextIndex = count($files);

        if($this->fileSizeCache->exists($fileSize)) {
            $indexes = $this->fileSizeCache->get($fileSize);

            foreach ($indexes as $index) {
                if ($this->filesIdentical($pathname, $files[$index])) {
                    return true;
                }
            }

            $this->fileSizeCache->put($fileSize, array_merge($this->fileSizeCache->get($fileSize), [$nextIndex]));
        } else {
            $this->fileSizeCache->put($fileSize, [$nextIndex]);
        }

        return false;
    }

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

    private function clearCache() {
        $this->fileSizeCache->clear();
        $this->scannedDirectories->clear();
    }
}