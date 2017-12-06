<?php

namespace App\LeafPlayer\Library;


use App\LeafPlayer\Library\Enum\LibraryActionType;
use App\LeafPlayer\Library\Enum\LibraryActorState;
use App\LeafPlayer\Models\Song;

class LibraryCleaner extends LibraryActor {
    public function __construct(ProgressCallbackInterface $progressCallback) {
        parent::__construct($progressCallback);

        $this->readyToPerform();
    }

    /**
     * Execute the scan
     *
     * @return void
     */
    protected function perform() {
        $this->setState(LibraryActorState::PROCESSING);

        $songs = Song::with(['files', 'album', 'artist'])->get();

        foreach ($songs as $song) {

        }

        // TODO: Implement perform() method.
    }

    /**
     * Get type of the current scan
     *
     * @return string
     */
    protected function getType() {
        return LibraryActionType::CLEAN;
    }
}