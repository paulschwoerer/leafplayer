<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateScannerTables extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        DB::beginTransaction();

        Schema::create('folders', function (Blueprint $table) {
            $table->increments('id');
            $table->string('path', 2048)->collation('utf8_bin');
            $table->boolean('selected');
            $table->timestamps();
        });

        Schema::create('scans', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('state');
            $table->string('current_file', 255)->collation('utf8_bin');
            $table->integer('scanned_files');
            $table->integer('total_files');
            $table->timestamps();
        });

        Schema::create('scan_errors', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('scan_id');
            $table->string('severity', 64)->collation('utf8_bin');
            $table->string('code', 128)->collation('utf8_bin');
            $table->string('details', 4096)->collation('utf8_bin');

            $table->foreign('scan_id')
                ->references('id')->on('scans')
                ->onDelete('cascade');
        });

        Schema::create('files', function (Blueprint $table) {
            $table->increments('id');
            $table->string('path', 8192)->collation('utf8_bin');
            $table->string('format', 8)->collation('utf8_bin');
            $table->unsignedInteger('last_modified');
        });

        DB::commit();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::dropIfExists('folders');
        Schema::dropIfExists('scans');
        Schema::dropIfExists('scan_errors');
        Schema::dropIfExists('files');
    }
}
