<?php

namespace App\LeafPlayer\Controllers\Api;

/**
 * Class ConfigApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class ConfigApiController extends BaseApiController {
    public function isDemo() {
        return $this->response(['result' => config('app.is_demo')]);
    }
}
