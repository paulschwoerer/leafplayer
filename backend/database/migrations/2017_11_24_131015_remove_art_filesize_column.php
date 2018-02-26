<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemoveArtFilesizeColumn extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::table('arts', function (Blueprint $table) {
            $table->dropColumn('filesize');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('arts', function (Blueprint $table) {
            $table->unsignedInteger('filesize');
        });
    }
}
