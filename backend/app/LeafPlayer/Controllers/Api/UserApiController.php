<?php

namespace App\LeafPlayer\Controllers\Api;

use App\LeafPlayer\Controllers\UserController;
use App\LeafPlayer\Models\User;
use App\LeafPlayer\Utils\CommonValidations;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * This controller is the layer between the API and the UserController.
 *
 * Class UserApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class UserApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new UserController;
    }

    /**
     * Create a user.
     *
     * @param Request $request
     * @return JsonResponse The newly created user in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\InvalidPasswordException
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\User\IdTakenException
     * @throws \App\LeafPlayer\Exceptions\Media\User\InvalidUserIdException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function createUser(Request $request) {
        $this->requirePermission('user.create');

        $this->validate($request, [
            'id' => 'required',
            'password' => 'required',
            'name' => 'string',
            'roles' => 'array',
            'roles.*' => 'numeric'
        ]);

        $user = $this->controller->createUser(
            $request->input('id'),
            $request->input('password'),
            $request->input('name', $request->input('id')),
            $request->input('roles', [])
        );

        $user = User::with('roles')->withCount('playlists')->find($user->id)->makeVisible(['type', 'playlist_count']);

        return $this->response($user);
    }

    /**
     * Get all data of a specific user.
     *
     * @param $id
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\User\NotFoundException
     */
    public function getUser($id) {
        $this->requirePermission('user.get');

        $user = $this->controller->getUser($id, ['roles']);

        $user->makeVisible(['type', 'playlist_count']);

        return $this->response($user);
    }

    /**
     * Remove a user and all of his data.
     *
     * @param $id
     * @return JsonResponse An object to determine if the operation was successful.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\User\SelfDeleteException
     */
    public function removeUser($id) {
        $this->requirePermission('user.remove');

        $success = $this->controller->removeUser($id);

        return $this->response(compact('success'));
    }

    /**
     * Force set password of a user.
     *
     * @param Request $request
     * @return JsonResponse An object to determine if the operation was successful.
     * @throws \App\LeafPlayer\Exceptions\Auth\InvalidPasswordException
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     * @throws \App\LeafPlayer\Exceptions\Media\User\NotFoundException
     */
    public function setUserPassword(Request $request) {
        $this->requirePermission('user.set-password');

        $this->validate($request, [
            'id' => 'required|string',
            'password' => 'required|string'
        ]);

        $success = $this->controller->setUserPassword(
            $request->input('id'),
            $request->input('password')
        );

        return $this->response(compact('success'));
    }

    /**
     * Query users based on different parameters.
     *
     * @param Request $request
     * @return JsonResponse Array of users in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function queryUsers(Request $request) {
        $this->requirePermission('user.query');

        $this->validate($request, CommonValidations::PAGINATION_PARAMS);

        $offset = (integer)$request->input('offset', 0);

        $users = $this->controller->queryUsers(
            $offset,
            (integer)$request->input('take', 50),
            ['roles']
        );

        $users->makeVisible('type', 'playlist_count');

        return $this->paginatedResponse($users, User::count(), $offset);
    }

    /**
     * Add given roles to user.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\User\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function addUserRoles(Request $request) {
        $this->requirePermission('user.add-roles');

        $this->validate($request, CommonValidations::USER_AND_ROLES);

        $user = $this->controller->addUserRoles($request->input('id'), $request->input('roles', []));

        $user = User::with('roles')->withCount('playlists')->find($user->id)->makeVisible(['type', 'playlist_count']);

        return $this->response($user);
    }

    /**
     * Remove given roles from user.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\User\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function removeUserRoles(Request $request) {
        $this->requirePermission('user.remove-roles');

        $this->validate($request, CommonValidations::USER_AND_ROLES);

        $user = $this->controller->removeUserRoles($request->input('id'), $request->input('roles', []));

        $user = User::with('roles')->withCount('playlists')->find($user->id)->makeVisible(['type', 'playlist_count']);

        return $this->response($user);
    }

    /**
     * Remove all roles a user is currently assigned to.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\User\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function removeAllUserRoles(Request $request) {
        $this->requirePermission('user.remove-all-roles');

        $this->validate($request, [
            'id' => 'required|string'
        ]);

        $user = (new UserController)->removeAllUserRoles($request->input('id'));

        $user = User::with('roles')->withCount('playlists')->find($user->id)->makeVisible(['type', 'playlist_count']);

        return $this->response($user);
    }

    /**
     * Get a given user's playlists.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Media\User\NotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function getUserPlaylists(Request $request, $id) {
        $this->requirePermission('user.get-playlists');

        $this->validate($request, array_merge(CommonValidations::PAGINATION_PARAMS, [
            'includeFavorites' => 'boolean'
        ]));

        $user = $this->controller->getUser($id);

        $offset = (integer)$request->input('offset', 0);
        $includeFavorites = $request->input('includeFavorites', false);

        $playlists = $this->controller->getUserPlaylists(
            $user,
            $offset,
            $request->input('take', 50),
            $includeFavorites
        );

        $playlists->makeVisible(['type', 'song_count', 'owner_id']);

        // total amount of the user's playlists
        $totalPlaylistCount = $this->controller->getUserPlaylistCount($user, $includeFavorites);

        return $this->paginatedResponse($playlists, $totalPlaylistCount, $offset);
    }
}
