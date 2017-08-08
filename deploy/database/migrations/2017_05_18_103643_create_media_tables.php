<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMediaTables extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        DB::beginTransaction();

        Schema::create('arts', function (Blueprint $table) {
            $table->increments('id');
            $table->string('file', 32);
            $table->string('md5', 32);
            $table->unsignedInteger('filesize');
            $table->timestamps();
        });

        Schema::create('albums', function (Blueprint $table) {
            $table->char('id', 8)->collation('utf8_bin');
            $table->char('artist_id', 8)->collation('utf8_bin');
            $table->string('name', 255);
            $table->integer('viewed');
            $table->integer('year');
            $table->timestamps();

            $table->primary('id');
        });

        Schema::create('artists', function (Blueprint $table) {
            $table->char('id', 8)->collation('utf8_bin');
            $table->string('name', 255);
            $table->integer('viewed');
            $table->timestamps();

            $table->primary('id');
        });

        Schema::create('songs', function (Blueprint $table) {
            $table->char('id', 8)->collation('utf8_bin');
            $table->char('album_id', 8)->collation('utf8_bin');
            $table->char('artist_id', 8)->collation('utf8_bin');
            $table->unsignedInteger('file_id');
            $table->string('title', 255);
            $table->integer('track');
            $table->integer('played');
            $table->integer('downloaded');
            $table->float('duration');
            $table->timestamps();

            $table->primary('id');
        });

        Schema::create('playlists', function (Blueprint $table) {
            $table->char('id', 8)->collation('utf8_bin');
            $table->string('owner_id', 32)->collation('utf8_bin');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->boolean('private');
            $table->timestamps();

            $table->primary('id');

            $table->foreign('owner_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
        });

        Schema::create('playlist_items', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('index');
            $table->string('title', 255);
            $table->char('song_id', 8)->collation('utf8_bin');
            $table->char('playlist_id', 8)->collation('utf8_bin');
            $table->timestamps();

            $table->foreign('playlist_id')
                ->references('id')->on('playlists')
                ->onDelete('cascade');
        });

        Schema::create('albums_arts', function (Blueprint $table) {
            $table->char('album_id', 8)->collation('utf8_bin');
            $table->unsignedInteger('art_id');

            $table->unique(['album_id', 'art_id']);

            $table->foreign('album_id')
                ->references('id')->on('albums')
                ->onDelete('cascade');

            $table->foreign('art_id')
                ->references('id')->on('arts')
                ->onDelete('cascade');
        });

        Schema::create('playlist_participants', function (Blueprint $table) {
            $table->char('playlist_id', 8)->collation('utf8_bin');
            $table->string('user_id', 32)->collation('utf8_bin');
            $table->boolean('can_edit');
            $table->boolean('can_delete');

            $table->foreign('playlist_id')
                ->references('id')->on('playlists')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
        });

        Schema::create('favoritable', function (Blueprint $table) {
            $table->string('user_id', 32)->collation('utf8_bin');
            $table->string('favoritable_type');
            $table->char('favoritable_id', 8)->collation('utf8_bin');

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
        });

        DB::commit();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::dropIfExists('arts');
        Schema::dropIfExists('albums');
        Schema::dropIfExists('artists');
        Schema::dropIfExists('songs');
        Schema::dropIfExists('playlist_items');
        Schema::dropIfExists('playlists');
        Schema::dropIfExists('albums_arts');
        Schema::dropIfExists('playlist_participants');
        Schema::dropIfExists('queues');
    }
}
