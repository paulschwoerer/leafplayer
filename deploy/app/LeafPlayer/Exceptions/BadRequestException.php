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
    public function __construct($type, $arguments = []) {
        $message = $this->build($type, $arguments);
 
        parent::__construct($message);
    }
}