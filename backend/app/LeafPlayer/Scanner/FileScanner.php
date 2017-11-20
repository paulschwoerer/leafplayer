<?php

namespace App\LeafPlayer\Scanner;


use getID3;

class FileScanner {
    private $getID3;

    public function __construct() {
        $this->getID3 = new getID3();
        $this->getID3->encoding = 'UTF-8';
        $this->getID3->option_tag_id3v1 = true;
        $this->getID3->option_tag_id3v2 = true;
        $this->getID3->option_tag_lyrics3 = true;
        $this->getID3->option_tag_apetag = false;
        $this->getID3->option_tags_process = true;
        $this->getID3->option_tags_html = true;
        $this->getID3->option_extra_info = false;
        $this->getID3->option_md5_data = false;
        $this->getID3->option_md5_data_source = false;
        $this->getID3->option_sha1_data = false;
    }

    public function scanFile($path) {
        $analyzedFile = $this->getID3->analyze($path);

        // Exit here on error
        if (isset($analyzedFile['error'])) {
            return ['error' => $analyzedFile['error']];
        }

        $parsedData = [];
        $parsedData['format_name']     = isset($analyzedFile['fileformat']) ? $analyzedFile['fileformat'] : '';
		$parsedData['encoder_version'] = isset($analyzedFile['audio']['encoder'])         ? $analyzedFile['audio']['encoder']         : '';
		$parsedData['encoder_options'] = isset($analyzedFile['audio']['encoder_options']) ? $analyzedFile['audio']['encoder_options'] : '';
        $parsedData['bitrate_mode']    = isset($analyzedFile['audio']['bitrate_mode'])    ? $analyzedFile['audio']['bitrate_mode']    : '';
        $parsedData['channels']        = isset($analyzedFile['audio']['channels'])        ? $analyzedFile['audio']['channels']        : '';
        $parsedData['sample_rate']     = isset($analyzedFile['audio']['sample_rate'])     ? $analyzedFile['audio']['sample_rate']     : '';
        $parsedData['bits_per_sample'] = isset($analyzedFile['audio']['bits_per_sample']) ? $analyzedFile['audio']['bits_per_sample'] : '';
        $parsedData['playing_time']    = isset($analyzedFile['playtime_seconds'])         ? $analyzedFile['playtime_seconds']         : '';
        $parsedData['avg_bit_rate']    = isset($analyzedFile['audio']['bitrate'])         ? $analyzedFile['audio']['bitrate']         : '';
        $parsedData['tags']            = isset($analyzedFile['tags'])                     ? $analyzedFile['tags']                     : '';
        $parsedData['comments']        = isset($analyzedFile['comments'])                 ? $analyzedFile['comments']                 : '';
        $parsedData['warning']         = isset($analyzedFile['warning'])                  ? $analyzedFile['warning']                  : '';

        return $parsedData;
    }
}