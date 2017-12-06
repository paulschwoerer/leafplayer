<?php

namespace App\LeafPlayer\Library;


use App\LeafPlayer\Library\Enum\FileExtension;
use App\LeafPlayer\Library\Enum\LibraryActionType;
use App\LeafPlayer\Library\Enum\LibraryActorState;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Art;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Models\File;
use App\LeafPlayer\Models\Song;
use Illuminate\Support\Facades\DB;

class LibraryWiper extends LibraryActor {
    /**
     * Execute the scan
     *
     * @return void
     */
    protected function perform() {
        $this->setState(LibraryActorState::PROCESSING);

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

        // TODO: Implement perform() method.
    }

    /**
     * Get type of the current scan
     *
     * @return string
     */
    protected function getType() {
        return LibraryActionType::WIPE;
    }
}