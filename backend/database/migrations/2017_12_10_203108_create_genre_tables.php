<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGenreTables extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('genres', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
        });

        Schema::create('songs_genres', function (Blueprint $table) {
            $table->char('song_id', 8)->collation('utf8_bin');
            $table->unsignedInteger('genre_id');

            $table->foreign('song_id')
                ->references('id')->on('songs')
                ->onDelete('cascade');

            $table->foreign('genre_id')
                ->references('id')->on('genres')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::dropIfExists('genres');
        Schema::dropIfExists('songs_genres');
    }
}
