<?php 

namespace App\LeafPlayer\Exceptions;
 
class TooManyRequestsException extends LeafPlayerException {
    /**
     * @var string
     */
    protected $status = '429';

    /**
     * @param string $type
     * @param $arguments
     */
    public function __construct($type = 'errors.default.too_many_requests', $arguments = []) {
        $message = $this->build($type, $arguments);

        parent::__construct($message);
    }
}