<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyScanTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::table('scans', function (Blueprint $table) {
            $table->dropColumn('current_file');
            $table->dropColumn('state');
            $table->integer('duration');
            $table->boolean('aborted');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('scans', function (Blueprint $table) {
            $table->integer('state');
            $table->string('current_file', 255)->collation('utf8_bin');
            $table->dropColumn('duration');
            $table->dropColumn('aborted');
        });
    }
}
