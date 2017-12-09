<?php


use App\LeafPlayer\Controllers\LibraryController;
use App\LeafPlayer\Library\LibraryCleaner;
use App\LeafPlayer\Library\LibraryScanner;
use App\LeafPlayer\Library\ProgressCallbackVoid;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Models\Folder;
use App\LeafPlayer\Models\Song;
use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Testing\DatabaseMigrations;

class LibraryCleanerTest extends TestCase {
    use DatabaseMigrations;

    public function testCleaning() {
        $basePath = base_path('tests/library/testmusic');
        $path1 = $basePath . '/Dance';
        $path2 = $basePath . '/Jazz';

        $libraryController = new LibraryController();

        $libraryController->addFolder($path1, true);
        $libraryController->addFolder($path2, true);

        (new LibraryScanner(new ProgressCallbackVoid()));

        $this->seeInDatabase(Artist::getTableName(), ['name' => 'Purple Planet Music']);
        $this->seeInDatabase(Album::getTableName(), ['name' => 'Dance', 'year' => 2016]);
        $this->seeInDatabase(Album::getTableName(), ['name' => 'Jazz', 'year' => 2017]);
        $this->seeInDatabase(Song::getTableName(), ['title' => 'Deep In Trance']);
        $this->seeInDatabase(Song::getTableName(), ['title' => 'Movin\' On']);
        $this->seeInDatabase(Song::getTableName(), ['title' => 'Prohibition Blues']);

        $libraryController->removeFolder(1);

        (new LibraryCleaner(new ProgressCallbackVoid()));

        $this->notSeeInDatabase(Album::getTableName(), ['name' => 'Dance', 'year' => 2016]);
        $this->notSeeInDatabase(Song::getTableName(), ['title' => 'Deep In Trance']);
    }
}
