<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemoveFileIdFromSongsTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::table('songs', function (Blueprint $table) {
            $table->dropColumn('file_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('songs', function (Blueprint $table) {
            $table->unsignedInteger('file_id');
        });
    }
}
