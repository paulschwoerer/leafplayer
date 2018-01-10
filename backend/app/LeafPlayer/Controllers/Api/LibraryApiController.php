<?php

namespace App\LeafPlayer\Controllers\Api;

use App\LeafPlayer\Controllers\LibraryController;
use App\LeafPlayer\Library\Enum\LibraryActorState;
use App\LeafPlayer\Library\LibraryActor;
use Fuz\Component\SharedMemory\SharedMemory;
use Fuz\Component\SharedMemory\Storage\StorageFile;
use \Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

define('MIN_REFRESH_INTERVAL', .1); // min refresh interval of progress tracking in seconds
define('DEFAULT_REFRESH_INTERVAL', .5); // default refresh interval of progress tracking in seconds
define('MAX_REFRESH_INTERVAL', 4); // max refresh interval of progress tracking in seconds

/**
 * This controller is the layer between the API and the ScannerController.
 *
 * Class LibraryApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class LibraryApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new LibraryController;
    }

    /**
     * Check a folder for readability and existence
     *              This method should always be called before adding a folder as it
     *              returns detailed information and a clean path.
     *
     * @param Request $request
     * @return JsonResponse A JSON response with information about the folder.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Library\InvalidFolderException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function checkFolder(Request $request) {
        $this->requirePermission('library.folder.check');

        $this->validate($request, [
            'path' => 'required|string'
        ]);

        $info = $this->controller->checkFolder($request->input('path'));

        return $this->response($info);
    }

    /**
     * Add a folder for the scanner to search for media
     *
     * @param Request $request
     * @return JsonResponse A JSON response containing the added folder.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Library\FolderNotAddedException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function addFolder(Request $request) {
        $this->requirePermission('library.folder.add');

        $this->validate($request, [
            'path' => 'required|string',
            'selected' => 'boolean'
        ]);

        $folder = $this->controller->addFolder(
            $request->input('path'),
            $request->input('selected', true)
        );

        return $this->response($folder);
    }

    /**
     * Set if a folder should be included in scans or not
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse A JSON response containing the updated folder.
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Library\FolderNotFoundException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function updateFolderSelectedState(Request $request, $id) {
        $this->requirePermission('library.folder.update-selected-state');

        $this->validate($request, [
            'selected' => 'boolean'
        ]);

        $folder = $this->controller->updateFolderSelectedState(
            $id,
            $request->input('selected')
        );

        return $this->response($folder);
    }

    /**
     * Remove a folder.
     *
     * @param $id
     * @return JsonResponse A JSON response to determine if the operation was successful
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     */
    public function removeFolder($id) {
        $this->requirePermission('library.folder.remove');

        $success = $this->controller->removeFolder($id);

        return $this->response(compact('success'));
    }

    /**
     * Get a list of all folders currently added
     * @return JsonResponse A JSON response containing a list of all folders
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     */
    public function getAllFolders() {
        $this->requirePermission('library.folder.get-all');

        return $this->response($this->controller->getAllFolders());
    }

    /**
     * Start scan with given options
     *
     * @param Request $request
     * @return JsonResponse A JSON response to determine if the operation was successful
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Library\ScanInProgressException
     */
    public function startScan(Request $request) {
        $this->requirePermission('library.scan');

        $success = $this->controller->startScan(
            $request->input('updateExisting', true),
            $request->input('clean', false)
        );

        return $this->response(compact('success'));
    }

    /**
     * Clean the library from non-existing songs
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     */
    public function cleanLibrary(Request $request) {
        $this->requirePermission('library.clean');

        $success = (new LibraryController)->cleanLibrary();

        return $this->response(compact('success'));
    }

    /**
     * Clear the library
     *
     * @param Request $request
     * @return JsonResponse
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     */
    public function wipeLibrary(Request $request) {
        $this->requirePermission('library.wipe');

        $success = (new LibraryController)->wipeLibrary();

        return $this->response(compact('success'));
    }

    /**
     * Stream the progress of the current scan using server sent events (SSE)
     *
     * @param Request $request
     * @return StreamedResponse The streamed response containing JSON encoded information about the scan
     * @throws \App\LeafPlayer\Exceptions\Auth\NoPermissionException
     * @throws \App\LeafPlayer\Exceptions\Request\ValidationException
     */
    public function getScanProgress(Request $request) {
        $this->requirePermission('library.scan-progress');

        set_time_limit(0);

        @ob_end_clean();

        $this->validate($request, [
            'refreshInterval' => 'numeric'
        ]);

        $refreshInterval = clamp(
            $request->input('refreshInterval', DEFAULT_REFRESH_INTERVAL),
            MIN_REFRESH_INTERVAL,
            MAX_REFRESH_INTERVAL
        );

        $sharedScanInfo = new SharedMemory(new StorageFile(LibraryActor::getSyncFilePath()));

        $response = new StreamedResponse(function() use ($refreshInterval, &$sharedScanInfo) {
            while(1) {
                if (!isset($sharedScanInfo->currentState) || $sharedScanInfo->currentState === LibraryActorState::FINISHED) {
                    echo 'data: ' . json_encode([
                            'running' => false,
                            'details' => []
                        ]) . PHP_EOL . PHP_EOL;

                } else {
                    echo 'data: ' . json_encode([
                            'running' => true,
                            'details' => [
                                'type' => $sharedScanInfo->type,
                                'currentState' => $sharedScanInfo->currentState,
                                'currentItem' => is_string($sharedScanInfo->currentItem) ? $sharedScanInfo->currentItem : '',
                                'totalItemCount' => is_int($sharedScanInfo->totalItemCount) ? $sharedScanInfo->totalItemCount : 0,
                                'processedItemCount' => is_int($sharedScanInfo->processedItemCount) ? $sharedScanInfo->processedItemCount : 0
                            ]
                        ]) . PHP_EOL . PHP_EOL;
                }

                @ob_flush();
                @flush();

                usleep($refreshInterval * 1000000);
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('X-Accel-Buffering', 'no');

        return $response;
    }
}
