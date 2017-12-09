<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAuthTables extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        DB::beginTransaction();

        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 32)->collation('utf8_bin');
            $table->string('name', 255);
            $table->string('password', 255)->collation('utf8_bin');
            $table->timestamps();

            $table->primary('id');
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->unique();
            $table->string('display_name')->nullable();
            $table->string('description')->nullable();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->unique();
            $table->string('display_name')->nullable();
            $table->string('description')->nullable();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('role_id');
            $table->string('permission')->collation('utf8_bin');

            $table->foreign('role_id')
                ->references('id')->on('roles')
                ->onDelete('cascade');
        });

        Schema::create('users_roles', function (Blueprint $table) {
            $table->string('user_id', 32)->collation('utf8_bin');
            $table->unsignedInteger('role_id');

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onDelete('cascade');

            $table->foreign('role_id')
                ->references('id')->on('roles')
                ->onDelete('cascade');

            $table->primary(['user_id', 'role_id']);
        });

        $this->seedPermissions();

        DB::commit();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::dropIfExists('users');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('roles_permissions');
        Schema::dropIfExists('users_roles');
    }

    private function seedPermissions() {
        DB::table('roles')->insert([
            [
                'name' => 'default',
                'display_name' => 'Default',
                'description' => 'This is a default role with some default permissions attached to get started quickly.'
            ],
            [
                'name' => 'admin',
                'display_name' => 'Admin',
                'description' => 'This is a the default admin role which has all permissions by default.'
            ]
        ]);

        DB::table('role_permissions')->insert([
            // Give admin role all permissions
            ['role_id' => 2, 'permission' => '*'],

            // Give some permissions to default role
            ['role_id' => 1, 'permission' => 'user.get'],
            ['role_id' => 1, 'permission' => 'user.query'],
            ['role_id' => 1, 'permission' => 'user.get-playlists'],

            ['role_id' => 1, 'permission' => 'album.get'],
            ['role_id' => 1, 'permission' => 'album.query'],
            ['role_id' => 1, 'permission' => 'album.suggestions'],

            ['role_id' => 1, 'permission' => 'artist.get'],
            ['role_id' => 1, 'permission' => 'artist.query'],

            ['role_id' => 1, 'permission' => 'collection.statistics'],
            ['role_id' => 1, 'permission' => 'collection.search'],

            ['role_id' => 1, 'permission' => 'playlist.create'],
            ['role_id' => 1, 'permission' => 'playlist.update'],
            ['role_id' => 1, 'permission' => 'playlist.get'],
            ['role_id' => 1, 'permission' => 'playlist.add-songs'],
            ['role_id' => 1, 'permission' => 'playlist.query'],
            ['role_id' => 1, 'permission' => 'playlist.remove-indexes'],
            ['role_id' => 1, 'permission' => 'playlist.set-order'],
            ['role_id' => 1, 'permission' => 'playlist.delete'],

            ['role_id' => 1, 'permission' => 'song.get'],
            ['role_id' => 1, 'permission' => 'song.by-id'],
            ['role_id' => 1, 'permission' => 'song.stream'],
            ['role_id' => 1, 'permission' => 'song.download'],
            ['role_id' => 1, 'permission' => 'song.popular'],

            ['role_id' => 1, 'permission' => 'auth.change-password'],
        ]);
    }
}
