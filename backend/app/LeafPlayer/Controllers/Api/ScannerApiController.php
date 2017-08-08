<?php

namespace App\LeafPlayer\Controllers\Api;

use App\LeafPlayer\Controllers\ScannerController;
use App\LeafPlayer\Models\Scan;
use App\LeafPlayer\Scanner\ScannerState;
use \Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;
use App\LeafPlayer\Utils\Math;
use Symfony\Component\HttpFoundation\StreamedResponse;

define('MIN_REFRESH_INTERVAL', .1); // min refresh interval of progress tracking in seconds
define('DEFAULT_REFRESH_INTERVAL', .5); // default refresh interval of progress tracking in seconds
define('MAX_REFRESH_INTERVAL', 4); // max refresh interval of progress tracking in seconds

/**
 * This controller is the layer between the API and the ScannerController.
 *
 * Class ScannerApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class ScannerApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new ScannerController;
    }

    /**
     * Check a folder for readability and existence.
     *              This method should always be called before adding a folder as it
     *              returns detailed information and a clean path.
     *
     * @param Request $request
     * @return JsonResponse A JSON response with information about the folder.
     */
    public function checkFolder(Request $request) {
        $this->requirePermission('scanner.folder.check');

        $this->validate($request, [
            'path' => 'required|string'
        ]);

        $info = $this->controller->checkFolder($request->input('path'));

        return $this->response($info);
    }

    /**
     * Add a folder for the scanner to search for media.
     *
     * @param Request $request
     * @return JsonResponse A JSON response containing the added folder.
     */
    public function addFolder(Request $request) {
        $this->requirePermission('scanner.folder.add');

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
     * Set if a folder should be included in scans or not.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse A JSON response containing the updated folder.
     */
    public function updateFolderSelectedState(Request $request, $id) {
        $this->requirePermission('scanner.folder.update-selected-state');

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
     * @return JsonResponse A JSON response to determine if the operation was successful.
     */
    public function removeFolder($id) {
        $this->requirePermission('scanner.folder.remove');

        $success = $this->controller->removeFolder($id);

        return $this->response(compact('success'));
    }

    /**
     * Get a list of all folders currently added.
     * @return JsonResponse A JSON response containing a list of all folders.
     */
    public function getAllFolders() {
        $this->requirePermission('scanner.folder.get-all');

        return $this->response($this->controller->getAllFolders());
    }

    /**
     * Start scan with given options.
     *
     * @param Request $request
     * @return JsonResponse A JSON response to determine if the operation was successful.
     */
    public function startScan(Request $request) {
        $this->requirePermission('scanner.library.scan');

        $this->validate($request, [
            'options.updateExisting' => 'boolean',
            'options.clean' => 'boolean',
        ]);

        $success = $this->controller->startScan(
            $request->input('updateExisting', true),
            $request->input('clean', false)
        );

        return $this->response(compact('success'));
    }

    /**
     * Clean the library from non-existing songs.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function cleanLibrary(Request $request) {
        $this->requirePermission('scanner.library.scan');

        $success = (new ScannerController)->cleanLibrary();

        return $this->response(compact('success'));
    }

    /**
     * Clear the library.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clearLibrary(Request $request) {
        $this->requirePermission('scanner.library.clear');

        $success = (new ScannerController)->clearLibrary();

        return $this->response(compact('success'));
    }

    /**
     * Stream the progress of the current scan using server sent events (SSE).
     *
     * @param Request $request
     * @return StreamedResponse The streamed response containing JSON encoded information about the scan.
     */
    public function getScanProgress(Request $request) {
        $this->requirePermission('scanner.library.scan.progress');

        $this->validate($request, [
            'refreshInterval' => 'numeric'
        ]);

        $refreshInterval = Math::clamp(
            $request->input('refreshInterval', DEFAULT_REFRESH_INTERVAL),
            MIN_REFRESH_INTERVAL,
            MAX_REFRESH_INTERVAL
        );

        $response = new StreamedResponse(function() use ($refreshInterval) {
            while(1) {
                $scan = Scan::where('state', '<>', ScannerState::FINISHED)->first();

                if ($scan == null) {
                    echo 'data: ' . json_encode([
                            'running' => false,
                            'details' => []
                        ]) . "\n\n";
                } else {
                    echo 'data: ' . json_encode([
                            'running' => true,
                            'details' => [
                                'state' => $scan->state,
                                'currentFile' => $scan->current_file,
                                'scannedFiles' => $scan->scanned_files,
                                'totalFiles' => $scan->total_files
                            ]
                        ]) . "\n\n";
                }

                ob_flush();
                flush();

                usleep($refreshInterval * 1000000);
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        return $response;
    }
}
