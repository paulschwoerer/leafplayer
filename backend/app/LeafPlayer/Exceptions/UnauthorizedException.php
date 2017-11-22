<?php 

namespace App\LeafPlayer\Exceptions;
 
class UnauthorizedException extends LeafPlayerException {
    /**
     * @var string
     */
    protected $status = '401';

    /**
     * @param string $type
     * @param $arguments
     */
    public function __construct($type = 'errors.default.unauthorized', $arguments = []) {
        $message = $this->build($type, $arguments);

        parent::__construct($message);
    }
}