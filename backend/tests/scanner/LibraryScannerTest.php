<?php


use App\LeafPlayer\Controllers\LibraryController;
use App\LeafPlayer\Library\LibraryScanner;
use App\LeafPlayer\Library\ProgressCallbackVoid;
use App\LeafPlayer\Models\Album;
use App\LeafPlayer\Models\Artist;
use App\LeafPlayer\Models\Folder;
use App\LeafPlayer\Models\Song;
use App\LeafPlayer\Library\Scanner;
use App\LeafPlayer\Library\ScannerAction;
use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Testing\DatabaseMigrations;

class LibraryScannerTest extends TestCase {
    use DatabaseMigrations;

    public function setUp() {
        $this->refreshApplication();
    }

    public function testScanResults() {
        $path = base_path('tests/scanner/testmusic');

        DB::table(Folder::getTableName())->delete();

        (new LibraryController())->addFolder($path, true);

        $this->seeInDatabase(Folder::getTableName(), ['path' => realpath($path)]);

        new LibraryScanner(new ProgressCallbackVoid());

        $this->seeInDatabase(Artist::getTableName(), ['name' => 'Purple Planet Music']);
        $this->seeInDatabase(Artist::getTableName(), ['name' => 'Alternate Artist']);

        $this->seeInDatabase(Album::getTableName(), ['name' => 'Dance', 'year' => 2016]);
        $this->seeInDatabase(Album::getTableName(), ['name' => 'Relaxing', 'year' => 2013]);
        $this->seeInDatabase(Album::getTableName(), ['name' => 'Jazz', 'year' => 2017]);

        $this->seeInDatabase(Song::getTableName(), ['title' => 'Deep In Trance']);
        $this->seeInDatabase(Song::getTableName(), ['title' => 'Movin\' On']);
        $this->seeInDatabase(Song::getTableName(), ['title' => 'Prohibition Blues']);
        $this->seeInDatabase(Song::getTableName(), ['title' => 'A Touch Of Zen']);
        $this->seeInDatabase(Song::getTableName(), ['title' => 'Pacific Whalesong']);
    }
}
