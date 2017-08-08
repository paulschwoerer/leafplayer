<?php

// +----------------------------------------------------------------------+
// | PHP version 4.1.0                                                    |
// +----------------------------------------------------------------------+
// | Placed in public domain by Allan Hansen, 2002. Share and enjoy!      |
// +----------------------------------------------------------------------+
// | /demo/demo.audioinfo.class.php                                       |
// |                                                                      |
// | Example wrapper class to extract information from audio files        |
// | through getID3().                                                    |
// |                                                                      |
// | getID3() returns a lot of information. Much of this information is   |
// | not needed for the end-application. It is also possible that some    |
// | users want to extract specific info. Modifying getID3() files is a   |
// | bad idea, as modifications needs to be done to future versions of    |
// | getID3().                                                            |
// |                                                                      |
// | Modify this wrapper class instead. This example extracts certain     |
// | fields only and adds a new root value - encoder_options if possible. |
// | It also checks for mp3 files with wave headers.                      |
// +----------------------------------------------------------------------+
// | Example code:                                                        |
// |   $au = new AudioInfo();                                             |
// |   print_r($au->Info('file.flac');                                    |
// +----------------------------------------------------------------------+
// | Authors: Allan Hansen <ahØartemis*dk> 
// | Modified by Paul Schwörer
// +----------------------------------------------------------------------+
//

namespace App\LeafPlayer\Scanner;

use getID3;
use Illuminate\Support\Facades\Log;

/**
* Class for extracting information from audio files with getID3().
*/

class FileInfo {
    private $getID3 = null;

	/**
	* Constructor
	*/
	public function __construct () {

		// Initialize getID3 engine
		$this->getID3 = new getID3;
        $this->getID3->encoding = 'UTF-8';
        $this->getID3->option_tag_id3v1 = true;
		$this->getID3->option_tag_id3v2 = true;
		$this->getID3->option_tag_lyrics3 = true;
		$this->getID3->option_tag_apetag = false;
		$this->getID3->option_tags_process = true;
		$this->getID3->option_tags_html = true;
		$this->getID3->option_tags_html = true;
		$this->getID3->option_extra_info = false;
		$this->getID3->option_md5_data = false;
		$this->getID3->option_md5_data_source = false;
		$this->getID3->option_sha1_data = false;
	}

    /**
     * Extract information about a given file.
     *
     * @param $file string Audio file to extract info from.
     * @return array|null
     */
	public function info($file) {
		// Analyze file
        $analyzedFile = $this->getID3->analyze($file);

		// Exit here on error
		if (isset($analyzedFile['error'])) {
            Log::notice('An error occurred, please check the scanner log.');
			return ['error' => $analyzedFile['error']];
		}

		$parsedData = [];
		$parsedData['format_name']     = isset($analyzedFile['fileformat']) ? $analyzedFile['fileformat'] : '';
		$parsedData['encoder_version'] = (isset($analyzedFile['audio']['encoder'])         ? $analyzedFile['audio']['encoder']         : '');
		$parsedData['encoder_options'] = (isset($analyzedFile['audio']['encoder_options']) ? $analyzedFile['audio']['encoder_options'] : '');
		$parsedData['bitrate_mode']    = (isset($analyzedFile['audio']['bitrate_mode'])    ? $analyzedFile['audio']['bitrate_mode']    : '');
		$parsedData['channels']        = (isset($analyzedFile['audio']['channels'])        ? $analyzedFile['audio']['channels']        : '');
		$parsedData['sample_rate']     = (isset($analyzedFile['audio']['sample_rate'])     ? $analyzedFile['audio']['sample_rate']     : '');
		$parsedData['bits_per_sample'] = (isset($analyzedFile['audio']['bits_per_sample']) ? $analyzedFile['audio']['bits_per_sample'] : '');
		$parsedData['playing_time']    = (isset($analyzedFile['playtime_seconds'])         ? $analyzedFile['playtime_seconds']         : '');
		$parsedData['avg_bit_rate']    = (isset($analyzedFile['audio']['bitrate'])         ? $analyzedFile['audio']['bitrate']         : '');
		$parsedData['tags']            = (isset($analyzedFile['tags'])                     ? $analyzedFile['tags']                     : '');
		$parsedData['comments']        = (isset($analyzedFile['comments'])                 ? $analyzedFile['comments']                 : '');
		$parsedData['warning']         = (isset($analyzedFile['warning'])                  ? $analyzedFile['warning']                  : '');

		return $parsedData;
	}
}
