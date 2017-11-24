<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeArtFileColumn extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::table('arts', function (Blueprint $table) {
            $table->string('file', 36)->change();
            $table->unique('file');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('arts', function (Blueprint $table) {
            $table->string('file', 32)->change();
            $table->dropUnique('file');
        });
    }
}
