<?php

return [
    /*
     * Set a time limit for the scanner in seconds.
     * Default is 5 minutes.
     * If you have a really big library or a slow server, consider raising this value.
     */
    'time_limit' => env('SCANNER_TIME_LIMIT', 300),

    /*
     * Set refresh interval for scanner progress updates to database in seconds.
     * Default is one second.
     */
    'refresh_interval' => env('REFRESH_INTERVAL', 1)
];
