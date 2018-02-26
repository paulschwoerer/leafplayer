<?php

namespace App\LeafPlayer\Controllers\Api;

use Tymon\JWTAuth\JWTAuth;
use \Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;
use App\LeafPlayer\Controllers\AuthController;

/**
 * This controller is the layer between the API and the AuthController.
 *
 * Class ArtistApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class AuthApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new AuthController();
    }

    /**
     * Authenticate a user against the database and return a JWT token.
     *
     * @param Request $request
     * @return JsonResponse The token that was created for the user.
     * @throws \App\LeafPlayer\Exceptions\Auth\InvalidCredentialsException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function authenticate(Request $request) {
        $this->validate($request, [
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        $token = $this->controller->authenticate(
            $request->input('username'),
            $request->input('password')
        );

        return $this->response(compact('token'));
    }

    /**
     * Refresh the JWT token of a user.
     *
     * @return JsonResponse The refreshed token for the user.
     * @throws \App\LeafPlayer\Exceptions\Auth\ExpiredTokenException
     * @throws \App\LeafPlayer\Exceptions\Auth\TokenNotProvidedException
     */
    public function refreshToken() {
        $token = $this->controller->refreshToken();

        return $this->response(compact('token'));
    }

    public function logout() {
        $success = $this->controller->logout();

        return $this->response(compact('success'));
    }

    /**
     * Get the currently authenticated user.
     * @return JsonResponse The current user in JSON format.
     * @throws \App\LeafPlayer\Exceptions\Auth\ExpiredTokenException
     * @throws \App\LeafPlayer\Exceptions\Auth\InvalidTokenProvidedException
     * @throws \App\LeafPlayer\Exceptions\Auth\UserNotFoundException
     * @throws \App\LeafPlayer\Exceptions\UnauthorizedException
     */
    public function getCurrentUser() {
        $user = $this->controller->getCurrentUser(['roles']);

        $user->makeVisible(['type', 'playlist_count']);

        return $this->response($user);
    }

    /**
     * Change password of the current user.
     *
     * @param Request $request
     * @return JsonResponse An object to determine if the operation was successful.
     * @throws \App\LeafPlayer\Exceptions\Auth\InvalidPasswordException
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Auth\WrongPasswordException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function changeUserPassword(Request $request) {
        $this->requirePermission('auth.change-password');

        $this->validate($request, [
            'oldPassword' => 'required|string',
            'newPassword' => 'required|string'
        ]);

        $success = $this->controller->changeUserPassword(
            $request->input('oldPassword'),
            $request->input('newPassword')
        );

        return $this->response(compact('success'));
    }
}
