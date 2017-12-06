<?php

namespace App\LeafPlayer\Controllers\Api;

use \Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;
use App\LeafPlayer\Utils\CommonValidations;
use App\LeafPlayer\Controllers\SongController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use App\LeafPlayer\Exceptions\Library\FileNotFoundException;
use App\LeafPlayer\Exceptions\Library\FileNotReadableException;

/**
 * This controller is the layer between the API and the SongController.
 *
 * Class SongApiController
 * @package App\LeafPlayer\Controllers\Api
 */
class SongApiController extends BaseApiController {
    protected $controller;

    public function __construct() {
        $this->controller = new SongController;
    }

    /**
     * Get popular songs
     *
     * @return JsonResponse
     */
    public function getPopularSongs() {
        $this->requirePermission('song.popular');

        $songs = $this->controller->getPopularSongs([
            'album' => function($query) {
                $query->select('id', 'name');
            },
            'artist' => function($query) {
                $query->select('id', 'name');
            }
        ]);

        $songs->makeVisible('type');

        return $this->response($songs);
    }

    /**
     * Get a song in JSON format.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSong(Request $request) {
        $this->requirePermission('song.get');

        $this->validate($request, CommonValidations::MODEL_ID);

        $song = $this->controller->getSong($request->input('id'));

        return $this->response($song, collect([
            $song->album,
            $song->artist
        ]));
    }

    /**
     * Get songs by their Ids.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSongsById(Request $request) {
        $this->requirePermission('song.by-id');

        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'string'
        ]);

        $songs = $this->controller->getSongsById(
            $request->input('ids'),
            [
                'album' => function($query) {
                    $query->select('id', 'name');
                },
                'artist' => function($query) {
                    $query->select('id', 'name');
                }
            ]
        );

        $songs->makeVisible('type');

        return $this->response($songs);
    }

    /**
     * Outputs a file stream of a specific song.
     *
     * @param $id
     * @return BinaryFileResponse
     * @throws FileNotFoundException
     * @throws FileNotReadableException
     */
    public function streamSong($id) {
        $this->requirePermission('song.stream');

        set_time_limit(0); // this may take a while

        $song = (new SongController)->getSong($id);

        $file = $song->getFirstAvailableFile();

        if (!file_exists($file->path)) {
            throw new FileNotFoundException($song->id);
        }

        if (!is_readable($file->path)) {
            throw new FileNotReadableException($song->id);
        }

        // update play count on Song
        $song->played++;
        $song->save();

        return new BinaryFileResponse($file->path);
    }

    /**
     * Create a downloadable file for a user to grab.
     *
     * @param $id
     * @return BinaryFileResponse
     * @throws FileNotFoundException
     * @throws FileNotReadableException
     */
    public function downloadSong($id) {
        $this->requirePermission('song.download');

        set_time_limit(0); // this may take a while

        $song = (new SongController)->getSong($id);

        $file = $song->getFirstAvailableFile();

        if (!file_exists($file->path))
            throw new FileNotFoundException($song->id);

        if (!is_readable($file->path))
            throw new FileNotReadableException($song->id);

        // update download count on Song
        $song->downloaded++;
        $song->save();

        $name = sprintf('%s - %s - %s.%s',
            $song->artist->name,
            $song->album->name,
            $song->title,
            strtolower($file->format)
        );

        return response()->download($file->path, $name);
    }
}
