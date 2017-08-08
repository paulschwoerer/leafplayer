<?php 

namespace App\LeafPlayer\Exceptions;
 
class NotFoundException extends LeafPlayerException {
    /**
     * @var string
     */
    protected $status = '404';

    /**
     * @param string $type
     * @param $arguments
     */
    public function __construct($type, $arguments = []) {
        $message = $this->build($type, $arguments);

        parent::__construct($message);
    }
}