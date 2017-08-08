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
    public function __construct($type, $arguments = []) {
        $message = $this->build($type, $arguments);

        parent::__construct($message);
    }
}