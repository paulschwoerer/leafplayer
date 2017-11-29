<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSongIdToFilesTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::table('files', function (Blueprint $table) {
            $table->char('song_id', 8)->collation('utf8_bin')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn('song_id');
        });
    }
}
