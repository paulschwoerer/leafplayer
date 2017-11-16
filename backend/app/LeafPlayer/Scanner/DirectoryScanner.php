<?php

namespace App\LeafPlayer\Scanner;


use App\LeafPlayer\Exceptions\Scanner\NonExistingDirectoryException;
use App\LeafPlayer\Exceptions\Scanner\NonReadableDirectoryException;
use App\LeafPlayer\Utils\Map;
use DirectoryIterator;

class DirectoryScanner {
    private $maxScanDepth;

    private $imageFiles = [];
    private $audioFiles = [];

    private $audioFileTypes;
    private $imageFileTypes;

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
    }

    /**
     * Set the directories to scan
     *
     * Note: this method does not set any of the given directories,
     * if one of the directories can not be validated
     *
     * @param $directories
     */
    public function setScanDirectories($directories) {
        $this->validateDirectories($directories);

        $this->directories = array_map(function ($directory) {
            return realpath($directory);
        }, $directories);
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
    }

    public function setAudioFileTypes($fileTypes) {
        $this->audioFileTypes = $fileTypes;
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
    }

    public function setMaxScanDepth($depth) {
        $this->maxScanDepth = $depth;
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

                        if ($item->isReadable() && $item->isWritable()) {
                            array_push($this->audioFiles, $pathname);
                        }
                    }
                }
            }
        }
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
}