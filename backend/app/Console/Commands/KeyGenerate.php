<?php

namespace App\Console\Commands;

use App\LeafPlayer\Utils\DotEnvEditor;
use Illuminate\Support\Str;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;

class KeyGenerate extends Command {
    protected $name = 'key:generate';

    protected $description = "Set the application key";

    public function fire() {
        $key = $this->getRandomKey();

        (new DotEnvEditor)->changeEnv(['APP_KEY' => $key]);

        $this->info("Application key [$key] set successfully.");
    }

    protected function getRandomKey() {
        return Str::random(32);
    }
}
