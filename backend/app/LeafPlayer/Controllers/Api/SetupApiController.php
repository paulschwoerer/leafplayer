<?php

namespace App\LeafPlayer\Controllers\Api;

use App\LeafPlayer\Controllers\SetupController;
use Illuminate\Http\Request;

/**
 * This controller is the layer between the API and the AlbumController.
 *
 * Class AlbumApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class SetupApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new SetupController();
    }

    public function needsSetup() {
        return $this->response(['result' => $this->controller->needsSetup()]);
    }

    /**
     * Setup an admin account
     *
     * @param Request $request
     * @throws \App\LeafPlayer\Exceptions\Auth\InvalidPasswordException
     * @throws \App\LeafPlayer\Exceptions\Media\User\InvalidUserIdException
     * @throws \App\LeafPlayer\Exceptions\Setup\AdminAccountExistsException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function setupAdminAccount(Request $request) {
        $this->validate($request, [
            'id' => 'required',
            'password' => 'required',
            'name' => 'string'
        ]);

        $this->controller->setupAdminAccount(
            $request->input('id'),
            $request->input('name'),
            $request->input('password')
        );
    }
}
