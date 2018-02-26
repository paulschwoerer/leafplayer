<?php 

namespace App\LeafPlayer\Exceptions;
 
class ForbiddenException extends LeafPlayerException {
    /**
     * @var string
     */
    protected $status = '403';

    /**
     * @param string $type
     * @param $arguments
     */
    public function __construct($type = 'errors.default.forbidden', $arguments = []) {
        $message = $this->build($type, $arguments);

        parent::__construct($message);
    }
}