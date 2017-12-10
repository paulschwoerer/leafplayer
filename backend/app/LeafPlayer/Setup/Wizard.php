<?php

namespace App\LeafPlayer\Setup;

use App\LeafPlayer\Exceptions\Auth\InvalidPasswordException;
use App\LeafPlayer\Exceptions\Media\User\InvalidUserIdException;
use App\LeafPlayer\Exceptions\Setup\InvalidCredentialsException;
use App\LeafPlayer\Exceptions\Setup\NoDatabaseConnection;
use App\LeafPlayer\Exceptions\Setup\UnknownDatabaseException;
use App\LeafPlayer\Exceptions\Setup\UnknownErrorException;
use App\LeafPlayer\Utils\Security;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use PDOException;
use App\LeafPlayer\Utils\DotEnvEditor;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

const ENV_FILE = '.env';

class Wizard {
    private $fileSystem;

    private $isReinstall;

    public function __construct() {
        $this->fileSystem = new Filesystem();

        $this->isReinstall = $this->envExists();
    }

    public function envExists() {
        return $this->fileSystem->exists(base_path(ENV_FILE));
    }

    public function copyProdEnv() {
        $this->fileSystem->copy(base_path('.env.prod.example'), base_path(ENV_FILE));
    }

    public function copyDevEnv() {
        $this->fileSystem->copy(base_path('.env.prod.example'), base_path(ENV_FILE));
    }

    public function dropDatabaseTables() {
        foreach(DB::select('SHOW TABLES') as $table) {
            $tableData = get_object_vars($table);
            Schema::drop($tableData[key($tableData)]);
        }
    }

    public function createAdminAccount($username, $displayName, $password) {
        if (!Security::checkUserId($username)) {
            throw new InvalidUserIdException;
        }

        if (!Security::checkPassword($password)) {
            throw new InvalidPasswordException;
        }

        $time = Carbon::now()->toDayDateTimeString();

        DB::table('users')->insert([
            'id' => $username,
            'name' => $displayName,
            'password' => Hash::make($password),
            'created_at' => $time,
            'updated_at' => $time
        ]);

        DB::table('users_roles')->insert([
            ['user_id' => $username, 'role_id' => 2],
            ['user_id' => $username, 'role_id' => 1],
        ]);
    }

    public function generateSecrets() {
        Artisan::call('key:generate');

        Artisan::call('jwt:secret', ['--force' => true]);
    }

    public function configureDatabase($config) {
        Config::set('database.connections.mysql.host', $config['host']);
        Config::set('database.connections.mysql.port', $config['port']);
        Config::set('database.connections.mysql.username', $config['user']);
        Config::set('database.connections.mysql.password', $config['password']);
        Config::set('database.connections.mysql.database', $config['database']);

        Config::set('database.default', 'mysql');

        try {
            DB::reconnect();

            DB::connection()->getPdo();
        } catch (PDOException $e) {
            switch ($e->getCode()) {
                case 2002:
                    throw new NoDatabaseConnection;
                case 1049:
                    throw new UnknownDatabaseException($config['database']);
                case 1045:
                    throw new InvalidCredentialsException($config['user']);
                default:
                    Log::debug('Error encountered while connecting to the database in setup.');
                    Log::debug($e->getMessage());

                    throw new UnknownErrorException;
            }
        }

        $this->saveDatabaseConfig($config);

        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        if ($this->isReinstall) {
            $this->dropDatabaseTables();
        }
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        $this->migrateDatabase();
    }

    public function migrateDatabase() {
        Artisan::call('migrate', ['--force' => true]);
    }

    private function saveDatabaseConfig($config) {
        (new DotEnvEditor())->changeEnv([
            'DB_CONNECTION' => 'mysql',
            'DB_HOST' => $config['host'],
            'DB_PORT' => $config['port'],
            'DB_DATABASE' => $config['database'],
            'DB_USERNAME' => $config['user'],
            'DB_PASSWORD' => $config['password'],
        ]);
    }
}