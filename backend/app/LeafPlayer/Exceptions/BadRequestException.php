<?php 

namespace App\LeafPlayer\Exceptions;
 
class BadRequestException extends LeafPlayerException {
    /**
     * @var string
     */
    protected $status = '400';

    /**
     * @param string $type
     * @param $arguments
     */
    public function __construct($type = 'errors.default.bad_request', $arguments = []) {
        $message = $this->build($type, $arguments);
 
        parent::__construct($message);
    }
}