<?php


use App\LeafPlayer\Exceptions\Scanner\NonExistingDirectoryException;
use App\LeafPlayer\Scanner\FileExtension;
use App\LeafPlayer\Scanner\DirectoryScanner;

function getArrayList($array) {
    $keyString = PHP_EOL;

    $keyString .= implode($array, PHP_EOL);

    return $keyString;
}

class DirectoryScannerTest extends TestCase {
    private $testFilePath;

    public function setUp() {
        $this->testFilePath = base_path('tests/scanner/testfiles');
    }

    public function testFileDuplicates() {
        $directoryScanner = new DirectoryScanner([$this->testFilePath], [], [FileExtension::MP3], 2);

        $directoryScanner->startScan();

        self::assertArrayOnlyHasValues($directoryScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test1.mp3'),
            realpath($this->testFilePath . '/same file size as test2.mp3'),
            realpath($this->testFilePath . '/copy of test2.mp3')
        ]);
    }

    public function testScanDepth() {
        $directoryScanner = new DirectoryScanner([$this->testFilePath], [FileExtension::JPG], [FileExtension::MP3], 2);

        $directoryScanner->startScan();

        self::assertArrayOnlyHasValues($directoryScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test/test2.jpg'),
            realpath($this->testFilePath . '/test1.jpg')
        ]);

        self::assertArrayOnlyHasValues($directoryScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test1.mp3'),
            realpath($this->testFilePath . '/same file size as test2.mp3'),
            realpath($this->testFilePath . '/copy of test2.mp3')
        ]);

        $directoryScanner->setMaxScanDepth(1);
        $directoryScanner->startScan(true);

        self::assertArrayDoesNotContainValues($directoryScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test/test2.mp3')
        ]);

        self::assertArrayDoesNotContainValues($directoryScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test/test2.jpg')
        ]);

        self::assertArrayOnlyHasValues($directoryScanner->getAudioFiles(), [
            realpath($this->testFilePath . '/test1.mp3'),
            realpath($this->testFilePath . '/same file size as test2.mp3'),
            realpath($this->testFilePath . '/copy of test2.mp3')
        ]);

        self::assertArrayOnlyHasValues($directoryScanner->getImageFiles(), [
            realpath($this->testFilePath . '/test1.jpg')
        ]);
    }

    public function testResultDiscarding() {
        $directoryScanner = new DirectoryScanner([$this->testFilePath], [FileExtension::JPG], [FileExtension::MP3], 2);
        $directoryScanner->startScan();

        self::assertArrayCount($directoryScanner->getAudioFiles(), 3);
        self::assertArrayCount($directoryScanner->getImageFiles(), 2);

        $directoryScanner->discardResults();

        self::assertArrayCount($directoryScanner->getAudioFiles(), 0);
        self::assertArrayCount($directoryScanner->getAudioFiles(), 0);
    }

    public function testValidateFolders() {
        self::expectException(NonExistingDirectoryException::class);

        new DirectoryScanner([
            realpath($this->testFilePath . '/test'),
            realpath($this->testFilePath . '/test1'),
        ], [FileExtension::JPG], [FileExtension::MP3]);
    }

    static function assertArrayOnlyHasValues($array, $values) {
        self::assertEquals(count($array), count($values),
            'Array should only contain values:' . getArrayList($values) . PHP_EOL . 'Contains instead:' . getArrayList($array));

        foreach ($values as $value) {
            self::assertTrue(in_array($value, $array),
                'Array should only contain values:' . getArrayList($values) . PHP_EOL . 'Contains instead:' . getArrayList($array));
        }
    }

    static function assertArrayDoesNotContainValues($array, $values) {
        foreach ($values as $value) {
            self::assertFalse(in_array($value, $array), 'Map should not contain keys:' . getArrayList($values));
        }
    }

    static function assertArrayCount($array, $count) {
        self::assertTrue(
            count($array) === $count,
            'Count of map should be ' . $count . ', but is ' . count($array)
        );
    }
}
