<?php

namespace App\Exceptions;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Http\JsonResponse;
use Laravel\Lumen\Exceptions\Handler as ExceptionHandler;

use App\LeafPlayer\Exceptions\LeafPlayerException;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use PDOException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Debug\Exception\FatalErrorException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

class Handler extends ExceptionHandler {
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
         AuthorizationException::class,
         HttpException::class,
         ModelNotFoundException::class,
         ValidationException::class,
         LeafPlayerException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception $e
     * @return void
     * @throws Exception
     */
    public function report(Exception $e) {
        parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Exception $e
     * @return mixed
     */
    public function render($request, Exception $e) {
        return $this->handle($request, $e);
    }

    /**
     * Convert the Exception into a JSON HTTP Response
     *
     * @param Request $request
     * @param Exception $e
     * @return JsonResponse
     */
    private function handle(Request $request, Exception $e) {
        if ($e instanceof LeafPlayerException) {
            $data   = $e->toArray();
            $status = $e->getStatus();
        } else if ($e instanceof NotFoundHttpException) {
            $data = [
                'code' => 'not_found',
                'status' => '404',
                'description' => trans('errors.not_found')
            ];

            $status = 404;
        } else if ($e instanceof MethodNotAllowedHttpException) {
            $data = [
                'code' => 'method_not_allowed',
                'status' => '405',
                'description' => trans('errors.method_not_allowed')
            ];

            $status = 405;
        } else if ($e instanceof PDOException) {
            switch ($e->getCode()) {
                case 2002:
                    $data = [
                        'code' => 'no_database_connection',
                        'status' => '500',
                        'description' => trans('errors.database.no_connection')
                    ];

                    break;
                case 1049:
                    $data = [
                        'code' => 'unknown_database',
                        'status' => '500',
                        'description' => trans('errors.database.unknown_database', ['name' => DB::getDatabaseName()])
                    ];

                    break;
                case 1045:
                    $data = [
                        'code' => 'invalid_database_credentials',
                        'status' => '500',
                        'description' => trans('errors.database.invalid_credentials', ['user' => env('DB_USERNAME', 'unknown')])
                    ];

                    break;
                default:
                    $data = [
                        'code' => 'unknown_database_error',
                        'status' => '500',
                        'description' => trans('errors.database.unknown_error')
                    ];
            }

            $status = 500;
        } else if ($e instanceof TooManyRequestsHttpException) {
            $data = [
                'code' => 'too_many_requests',
                'status' => '429',
                'description' => trans('errors.too_many_requests')
            ];

            $status = 429;
        } else if ($e instanceof FatalErrorException || $e instanceof \ErrorException) {
            $data = [
                'code' => 'internal',
                'status' => '500',
                'description' => trans('errors.internal')
            ];

            $status = 500;
        } else {
            Log::error('Unhandled exception encountered:');
            Log::error(get_class($e));
            Log::error($e->getTraceAsString());

            $data = [
                'code' => 'unknown',
                'status' => '500',
                'description' => trans('errors.unknown')
            ];

            $status = 500;
        }

        $data['url'] = $request->getUri();

        return response()->json($data, $status);
    }
}
