<?php

namespace App\LeafPlayer\Exceptions;

use Exception;

abstract class LeafPlayerException extends Exception {
    /**
     * The code that is used to identify the Exception.
     *
     * @var string
     */
    protected $code;

    /**
     * The HTTP status of the Exception.
     *
     * @var string
     */
    protected $status;

    /**
     * The description of the Exception.
     *
     * @var string
     */
    protected $description;

    /**
     * Any details that should be send with the response.
     *
     * @var array
     */
    protected $details = [];

    /**
     * Exception constructor.
     *
     * @param string $message
     */
    public function __construct($message) {
        parent::__construct($message);
    }

    /**
     * Get the HTTP status casted to int.
     *
     * @return int
     */
    public function getStatus() {
        return (int)$this->status;
    }

    /**
     * Return the Exception as an array.
     *
     * @return array
     */
    public function toArray() {
        return [
            'code'     => $this->code,
            'status' => $this->status,
            'description'  => $this->description,
            'details' => $this->details
        ];
    }

    /**
     * Build the Exception.
     *
     * @param $code
     * @param $arguments
     * @return string
     * @internal param array $args
     */
    protected function build($code, $arguments) {
        $this->code = $code;

        $this->description = trans('errors.' . $this->code, $arguments);

        return $this->description;
    }
}