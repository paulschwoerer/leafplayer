<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Exceptions\Auth\InvalidPasswordException;
use App\LeafPlayer\Exceptions\Media\User\InvalidUserIdException;
use App\LeafPlayer\Exceptions\Media\User\IdTakenException;
use App\LeafPlayer\Exceptions\Media\User\NotFoundException;
use App\LeafPlayer\Exceptions\Media\User\SelfDeleteException;
use App\LeafPlayer\Models\Queue;
use App\LeafPlayer\Utils\Security;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\LeafPlayer\Models\User;

/**
 * This controller houses all the (API-)methods to interact with users.
 *
 * Class UserController
 * @package App\LeafPlayer\Controllers
 */
class UserController extends BaseController {
    /**
     * Force set password of a user.
     *
     * @param $id
     * @param $password
     * @return bool
     * @throws InvalidPasswordException
     * @throws NotFoundException
     */
    public function setUserPassword($id, $password) {
        $user = $this->getUser($id);

        if (!Security::checkPassword($password)) {
            throw new InvalidPasswordException;
        }

        $user->password = Hash::make($password);
        return $user->save();
    }

    /**
     * Creates a user with the given parameters.
     *
     * @param $id
     * @param $password
     * @param $name
     * @param array $roles An array of role id's this user should be assigned to.
     * @return User
     * @throws InvalidUserIdException
     * @throws InvalidPasswordException
     * @throws IdTakenException
     */
    public function createUser($id, $password, $name, $roles = []) {
        if(!Security::checkUserId($id)) {
            throw new InvalidUserIdException;
        }

        if (User::find($id) != null) {
            throw new IdTakenException($id);
        }

        if (!Security::checkPassword($password)) {
            throw new InvalidPasswordException;
        }

        DB::beginTransaction();

        $user = User::create(array_merge(compact('id', 'name'), [
            'password' => Hash::make($password)
        ]));

        $user->roles()->attach(array_merge($roles, [1]));

        DB::commit();

        return $user;
    }

    /**
     * Remove a user.
     *
     * @param $id
     * @return bool
     * @throws SelfDeleteException
     */
    public function removeUser($id) {
        if ($id === Auth::user()->id) {
            throw new SelfDeleteException;
        }

        return User::destroy($id) == 1;
    }

    /**
     * Add roles to a user.
     *
     * @param $id
     * @param $roles
     * @return User
     * @throws NotFoundException
     */
    public function addUserRoles($id, $roles) {
        $user = $this->getUser($id);

        $user->roles()->attach($roles);

        return $user;
    }

    /**
     * Remove roles from a user.
     *
     * @param $id
     * @param $roles
     * @return User
     * @throws NotFoundException
     */
    public function removeUserRoles($id, $roles) {
        $user = $this->getUser($id);

        $user->roles()->detach($roles);

        return $user;
    }

    /**
     * Remove all roles a user is currently assigned to.
     *
     * @param $id
     * @return mixed
     * @throws NotFoundException
     */
    public function removeAllUserRoles($id) {
        $user = $this->getUser($id);

        $user->roles()->detach();

        return $user;
    }

    /**
     * Get a user.
     *
     * @param $id
     * @param array $with
     * @return mixed
     * @throws NotFoundException
     */
    public function getUser($id, $with = []) {
        $user = User::with($with)->withCount('playlists')->find($id);

        if ($user == null) {
            throw new NotFoundException($id);
        }

        return $user;
    }

    /**
     * Query users based on different parameters
     *
     * @param $take
     * @param $offset
     * @param array $with
     * @return mixed
     */
    public function queryUsers($offset, $take, $with = []) {
        return User::with($with)
            ->withCount('playlists')
            ->offset($offset)
            ->take($take)
            ->orderBy('name')
            ->get();
    }

    /**
     * Get a given user's playlists.
     *
     * TODO: implement includeFavorites feature
     *
     * @param User $user
     * @param $offset
     * @param $take
     * @param bool $includeFavorites
     * @return mixed
     */
    public function getUserPlaylists(User $user, $offset, $take, $includeFavorites = false) {
        $query = $user->playlists()->withCount('items');

        if (Auth::user()->id !== $user->id) {
            $query->where('private', 0);
        }

        return $query->offset($offset)->take($take)->get();
    }

    /**
     * Get the amount of a given user's playlists.
     * TODO: implement includeFavorites feature
     *
     * @param User $user
     * @param bool $includeFavorites
     * @return mixed
     */
    public function getUserPlaylistCount(User $user, $includeFavorites = false) {
        $query = $user->playlists();

        if (Auth::user()->id !== $user->id) {
            $query->where('private', 0);
        }

        return $query->count();
    }
}
