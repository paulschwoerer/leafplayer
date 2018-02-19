<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Exceptions\Auth\InvalidPasswordException;
use App\LeafPlayer\Exceptions\Media\User\InvalidUserIdException;
use App\LeafPlayer\Exceptions\Setup\AdminAccountExistsException;
use App\LeafPlayer\Models\User;
use App\LeafPlayer\Utils\Security;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * This controller houses all the methods used for initial setup.
 *
 * Class SetupController
 * @package App\LeafPlayer\Controllers
 */
class SetupController extends BaseController {
    public function needsSetup() {
        return User::count() === 0;
    }

    /**
     * Setup an admin account
     *
     * @param $username
     * @param $displayName
     * @param $password
     * @throws InvalidPasswordException
     * @throws InvalidUserIdException
     * @throws AdminAccountExistsException
     */
    public function setupAdminAccount($username, $displayName, $password) {
        if (User::count() !== 0) {
            throw new AdminAccountExistsException();
        }

        if (!Security::checkUserId($username)) {
            throw new InvalidUserIdException;
        }

        if (!Security::checkPassword($password)) {
            throw new InvalidPasswordException;
        }

        $time = Carbon::now()->toDayDateTimeString();

        DB::table('users')->insert([
            'id' => $username,
            'name' => $displayName,
            'password' => Hash::make($password),
            'created_at' => $time,
            'updated_at' => $time
        ]);

        DB::table('users_roles')->insert([
            ['user_id' => $username, 'role_id' => 2],
            ['user_id' => $username, 'role_id' => 1],
        ]);
    }
}
