<?php


use App\LeafPlayer\Exceptions\Scanner\NonExistingDirectoryException;
use App\LeafPlayer\Scanner\FileExtension;
use App\LeafPlayer\Scanner\DirectoryScanner;
use App\LeafPlayer\Utils\Map;

function getKeyString($keys) {
    $keyString = PHP_EOL;

    foreach ($keys as $key) {
        $keyString .= $key . PHP_EOL;
    }

    return $keyString;
}

class FolderScannerTest extends TestCase
{
    private $testFilePath;

    public function setUp() {
        $this->testFilePath = base_path('tests/scanner/testfiles');
    }

    public function testScanDepth() {
        $folderScanner = new DirectoryScanner([$this->testFilePath], [FileExtension::JPG], [FileExtension::MP3], 2);

        $folderScanner->startScan();

        self::assertMapOnlyContainsKeys($folderScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test/test2.jpg'),
            realpath($this->testFilePath . '/test1.jpg')
        ]);

        self::assertMapOnlyContainsKeys($folderScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test/test2.mp3'),
            realpath($this->testFilePath . '/test1.mp3')
        ]);

        $folderScanner->setMaxScanDepth(1);
        $folderScanner->startScan(true);

        self::assertMapDoesNotContainKeys($folderScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test/test2.mp3')
        ]);

        self::assertMapDoesNotContainKeys($folderScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test/test2.jpg')
        ]);

        self::assertMapOnlyContainsKeys($folderScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test1.mp3')
        ]);

        self::assertMapOnlyContainsKeys($folderScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test1.jpg')
        ]);
    }

    public function testResultDiscarding() {
        $folderScanner = new DirectoryScanner([$this->testFilePath], [FileExtension::JPG], [FileExtension::MP3], 2);
        $folderScanner->startScan();

        self::assertMapIsCount($folderScanner->getAudioFiles(), 2);
        self::assertMapIsCount($folderScanner->getImageFiles(), 2);

        $folderScanner->discardResults();

        self::assertMapIsCount($folderScanner->getAudioFiles(), 0);
        self::assertMapIsCount($folderScanner->getAudioFiles(), 0);
    }

    public function testValidateFolders() {
        self::expectException(NonExistingDirectoryException::class);

        new DirectoryScanner([
            realpath($this->testFilePath . '/test'),
            realpath($this->testFilePath . '/test1'),
        ], [FileExtension::JPG], [FileExtension::MP3]);
    }

    static function assertMapOnlyContainsKeys(Map $map, $keys) {
        self::assertEquals($map->count(), count($keys),
            'Map should only contain keys:' . getKeyString($keys) . 'Contains instead: ' . getKeyString($map->keysToArray()));

        foreach ($keys as $key) {
            self::assertTrue($map->exists($key),
                'Map should only contain keys:' . getKeyString($keys) . 'Contains instead: ' . getKeyString($map->keysToArray()));
        }
    }

    static function assertMapDoesNotContainKeys(Map $map, $keys) {
        foreach ($keys as $key) {
            self::assertFalse($map->exists($key), 'Map should not contain keys:' . getKeyString($keys));
        }
    }

    static function assertMapIsCount(Map $map, $count) {
        self::assertTrue(
            $map->count() === $count,
            'Count of map should be ' . $count . ', but is ' . $map->count()
        );
    }
}
