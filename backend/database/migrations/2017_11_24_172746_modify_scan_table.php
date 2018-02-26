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
            $table->dropColumn('scanned_files');
            $table->dropColumn('total_files');
            $table->string('type');
            $table->integer('duration');
            $table->boolean('aborted');
            $table->integer('processed_items');
            $table->integer('total_items');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('scans', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->dropColumn('duration');
            $table->dropColumn('aborted');
            $table->dropColumn('processed_items');
            $table->dropColumn('total_items');

            $table->integer('state');
            $table->string('current_file', 255)->collation('utf8_bin');
            $table->integer('scanned_files');
            $table->integer('total_files');
        });
    }
}
