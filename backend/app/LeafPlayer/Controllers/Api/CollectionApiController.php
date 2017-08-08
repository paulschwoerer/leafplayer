<?php

namespace App\LeafPlayer\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\LeafPlayer\Controllers\CollectionController;

/**
 * This controller is the layer between the API and the CollectionController.
 *
 * Class CollectionApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class CollectionApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new CollectionController;
    }

    /**
     * Get statistics of the collection.
     *
     * @return JsonResponse
     */
    public function getCollectionStatistics() {
        $this->requirePermission('collection.statistics');

        return $this->response($this->controller->getCollectionStatistics());
    }

    /**
     * Search the collection for the given string.
     * TODO: prepare included data
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchCollection(Request $request) {
        $this->requirePermission('collection.search');

        $this->validate($request, [
            'search' => 'required|string'
        ]);

        $results = $this->controller->searchCollection($request->input('search'));

        return $this->response($results);
    }
}
