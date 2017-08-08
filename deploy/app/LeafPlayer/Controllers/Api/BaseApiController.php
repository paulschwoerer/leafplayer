<?php

namespace App\LeafPlayer\Controllers\Api;

use App\Http\Controllers\Controller;
use App\LeafPlayer\Exceptions\Auth\NoPermissionException;
use App\LeafPlayer\Exceptions\Request\ValidationException;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use \Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use \Illuminate\Support\Facades\Validator;

/**
 * This is the base controller for all LeafPlayer API controllers.
 *
 * Class BaseApiController
 * @package app\LeafPlayer\Controllers\Api
 */
abstract class BaseApiController extends Controller {
    /**
     * Overrides Lumen's default validate method to throw a custom Exception.
     *
     * @param Request $request
     * @param array $rules
     * @param array $messages
     * @param array $customAttributes
     * @return bool
     * @throws ValidationException
     */
    public function validate(Request $request, array $rules, array $messages = [], array $customAttributes = []) {
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator->errors());
        }

        return true;
    }

    /**
     * Returns a JSON response conform to the standards of the API.
     *
     * @param $data Model|Collection|array The data to be sent back to the client.
     * @param Collection|Model $included Included models.
     * @param int $statusCode In case a custom http status is required.
     * @return JsonResponse
     */
    protected function response($data, $included = null, $statusCode = 200) {
        if ($included === null) {
            $included = [];
        } else if (is_a($included, Model::class)) {
            $included = [$included];
        }

        return response()->json(compact('data', 'included'), $statusCode);
    }

    /**
     * Create a paginated response.
     *
     * @param Collection $items
     * @param $total
     * @param $offset
     * @return JsonResponse
     */
    protected function paginatedResponse(Collection $items, $total, $offset) {
        return $this->response($this->createPagination($items, $total, $offset));
    }

    /**
     * Create pagination data for a collection.
     *
     * @param Collection $items
     * @param $total
     * @param $offset
     * @return Collection
     */
    protected function createPagination(Collection $items, $total, $offset) {
        return collect([
            'total' => $total,
            'offset' => $offset,
            'take' => $items->count(),
            'items' => $items
        ]);
    }

    /**
     * This function will filter duplicated entries from an included collection.
     *
     * @param Collection $included
     * @return Collection
     */
    protected function filterIncluded(Collection $included) {
        return $included->unique(function ($item) {
            return $item->type.$item->id;
        })->values();
    }

    /**
     * Check the current user against a given permission.
     *
     * @param string $permission
     * @return bool
     * @throws NoPermissionException
     */
    protected function requirePermission($permission) {
        if (!Auth::user()->hasPermission($permission)) {
            throw new NoPermissionException($permission);
        }

        return true;
    }
}
