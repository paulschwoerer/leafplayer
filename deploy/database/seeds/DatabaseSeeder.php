<?php

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {
        $time = Carbon::now()->toDayDateTimeString();

        if (config('app.debug')) {
            DB::table('users')->insert([
                'id' => 'dev',
                'name' => 'Developer',
                'password' => Hash::make('dev'),
                'created_at' => $time,
                'updated_at' => $time
            ]);

            DB::table('users')->insert([
                'id' => 'dev2',
                'name' => 'Developer Account 2 with long name',
                'password' => Hash::make('dev2'),
                'created_at' => $time,
                'updated_at' => $time
            ]);

            DB::table('users_roles')->insert([
                ['user_id' => 'dev', 'role_id' => 2],
                ['user_id' => 'dev', 'role_id' => 1],
                ['user_id' => 'dev2', 'role_id' => 1],
            ]);
        } else {
            DB::table('users')->insert([
                'id' => 'admin',
                'name' => 'Administrator',
                'password' => Hash::make('supersecret_22!?'),
                'created_at' => $time,
                'updated_at' => $time
            ]);

            DB::table('users_roles')->insert([
                ['user_id' => 'admin', 'role_id' => 2],
                ['user_id' => 'admin', 'role_id' => 1],
            ]);
        }
    }
}
