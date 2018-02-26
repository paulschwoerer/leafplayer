<?php


use App\LeafPlayer\Exceptions\Library\NonExistingDirectoryException;
use App\LeafPlayer\Library\Enum\FileExtension;
use App\LeafPlayer\Library\DirectoryScanner;
use App\LeafPlayer\Library\Enum\FileInfoParams;
use App\LeafPlayer\Utils\Map;

function getArrayList($array) {
    $keyString = PHP_EOL;

    $keyString .= implode($array, PHP_EOL);

    return $keyString . PHP_EOL;
}

function getKeyString(Map $map) {
    $keyString = PHP_EOL;

    foreach ($map->keysToArray() as $key) {
        $keyString .= $key . PHP_EOL;
    }

    return $keyString . PHP_EOL;
}

class DirectoryScannerTest extends TestCase {
    private $testFilePath;

    public function setUp() {
        parent::setUp();

        $this->testFilePath = base_path('tests/library/testfiles');
    }

    public function testFileDuplicates() {
        $directoryScanner = new DirectoryScanner([$this->testFilePath], [], [FileExtension::MP3], 2);

        $directoryScanner->startScan();

        self::assertMapOnlyContainsKeys($directoryScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test/test2.mp3'),
            realpath($this->testFilePath . '/test1.mp3'),
            realpath($this->testFilePath . '/same file size as test2.mp3'),
            realpath($this->testFilePath . '/copy of test2.mp3')
        ]);

        self::assertTrue($directoryScanner->getAudioFiles()
            ->get(realpath($this->testFilePath . '/test/test2.mp3'))[FileInfoParams::DUPLICATE] === realpath($this->testFilePath . '/copy of test2.mp3')
        );
    }

    public function testScanDepth() {
        $directoryScanner = new DirectoryScanner([$this->testFilePath], [FileExtension::JPG], [FileExtension::MP3], 2);

        $directoryScanner->startScan();

        self::assertMapOnlyContainsKeys($directoryScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test/test2.jpg'),
            realpath($this->testFilePath . '/test1.jpg')
        ]);

        self::assertMapOnlyContainsKeys($directoryScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test/test2.mp3'),
            realpath($this->testFilePath . '/test1.mp3'),
            realpath($this->testFilePath . '/same file size as test2.mp3'),
            realpath($this->testFilePath . '/copy of test2.mp3')
        ]);

        $directoryScanner->setMaxScanDepth(1);
        $directoryScanner->startScan(true);

        self::assertMapDoesNotContainKeys($directoryScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test/test2.mp3')
        ]);

        self::assertMapDoesNotContainKeys($directoryScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test/test2.jpg')
        ]);

        self::assertMapOnlyContainsKeys($directoryScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test1.mp3'),
            realpath($this->testFilePath . '/same file size as test2.mp3'),
            realpath($this->testFilePath . '/copy of test2.mp3')
        ]);

        self::assertMapOnlyContainsKeys($directoryScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test1.jpg')
        ]);
    }

    public function testResultDiscarding() {
        $directoryScanner = new DirectoryScanner([$this->testFilePath], [FileExtension::JPG], [FileExtension::MP3], 2);
        $directoryScanner->startScan();

        self::assertMapIsCount($directoryScanner->getAudioFiles(), 4);
        self::assertMapIsCount($directoryScanner->getImageFiles(), 2);

        $directoryScanner->discardResults();

        self::assertMapIsCount($directoryScanner->getAudioFiles(), 0);
        self::assertMapIsCount($directoryScanner->getImageFiles(), 0);
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
            'Map should only contain values:' . getArrayList($keys) . 'Size ' . $map->count() . ' does not match expected ' . count($keys) . '.');

        foreach ($keys as $key) {
            self::assertTrue($map->exists($key),
                'Map should only contain values:' . getArrayList($keys) . 'Contains instead: ' . getKeyString($map));
        }
    }

    static function assertMapDoesNotContainKeys(Map $map, $keys) {
        foreach ($keys as $key) {
            self::assertFalse($map->exists($key), 'Map should not contain keys:' . getArrayList($keys));
        }
    }

    static function assertMapIsCount(Map $map, $count) {
        self::assertTrue(
            $map->count() === $count,
            'Count of map should be ' . $count . ', but is ' . $map->count()
        );
    }
}
