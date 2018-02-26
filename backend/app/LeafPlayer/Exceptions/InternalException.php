<?php 

namespace App\LeafPlayer\Exceptions;
 
class InternalException extends LeafPlayerException {
    /**
     * @var string
     */
    protected $status = '500';

    /**
     * @param string $type
     * @param $arguments
     */
    public function __construct($type = 'errors.default.internal', $arguments = []) {
        $message = $this->build($type, $arguments);

        parent::__construct($message);
    }
}