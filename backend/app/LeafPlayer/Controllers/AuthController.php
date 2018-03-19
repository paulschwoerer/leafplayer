<?php

namespace App\LeafPlayer\Controllers;

use App\LeafPlayer\Exceptions\Auth\ExpiredTokenException;
use App\LeafPlayer\Exceptions\Auth\InvalidCredentialsException;
use App\LeafPlayer\Exceptions\Auth\WrongPasswordException;
use App\LeafPlayer\Exceptions\Auth\InvalidTokenProvidedException;
use App\LeafPlayer\Exceptions\Auth\TokenNotProvidedException;
use App\LeafPlayer\Exceptions\Auth\UserNotFoundException;
use App\LeafPlayer\Exceptions\Auth\InvalidPasswordException;
use App\LeafPlayer\Exceptions\UnauthorizedException;
use App\LeafPlayer\Models\User;
use App\LeafPlayer\Utils\Security;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\TokenBlacklistedException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * This controller houses all the methods to authenticate against the API and get authentication information.
 *
 * Class AuthController
 * @package App\LeafPlayer\Controllers
 */
class AuthController extends BaseController {
    /**
     * Authenticate a user against the database and return a JWT token.
     *
     * @param $username
     * @param $password
     * @return string
     * @throws InvalidCredentialsException
     */
    public function authenticate($username, $password) {
        $token = Auth::attempt(['id' => $username, 'password' => $password]);

        if (!$token) {
            throw new InvalidCredentialsException;
        }

        return $token;
    }

    /**
     * Refresh the JWT token of a user.
     * @return string
     * @throws ExpiredTokenException
     * @throws TokenNotProvidedException
     */
    public function refreshToken() {
        try {
            $token = Auth::refresh();
        } catch (BadRequestHttpException $e) {
            throw new TokenNotProvidedException;
        } catch (TokenExpiredException $e) {
            throw new ExpiredTokenException;
        } catch (TokenBlacklistedException $e) {
            throw new ExpiredTokenException;
        }

        return $token;
    }

    /**
     * Logout the current user.
     *
     * @return bool
     */
    public function logout() {
        Auth::logout();

        return true;
    }

    /**
     * Get the currently authenticated user.
     * @param array $with
     * @return User
     * @throws \App\LeafPlayer\Exceptions\Media\User\NotFoundException
     */
    public function getCurrentUser($with = []) {
        return (new UserController)->getUser(Auth::user()->id, $with);
    }

    /**
     * Change the password of the current user.
     *
     * @param $oldPassword
     * @param $newPassword
     * @return bool
     * @throws InvalidPasswordException
     * @throws WrongPasswordException
     * @throws \App\LeafPlayer\Exceptions\Media\User\NotFoundException
     */
    public function changeUserPassword($oldPassword, $newPassword) {
        $user = $this->getCurrentUser();

        if (!Auth::validate(['id' => $user->id, 'password' => $oldPassword])) {
            throw new WrongPasswordException;
        }

        if (!Security::checkPassword($newPassword)) {
            throw new InvalidPasswordException;
        }

        $user->password = Hash::make($newPassword);

        return $user->save();
    }
}
