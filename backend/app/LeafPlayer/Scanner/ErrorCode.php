<?php

namespace App\LeafPlayer\Scanner;

abstract class ErrorCode {
    const FOLDER_NOT_READABLE = 'folder_not_readable';
    const FILE_NOT_READABLE = 'file_not_readable';
    const FILE_NOT_WRITEABLE = 'file_not_writeable';
    const TAGS_INVALID = 'tags_invalid';
    const DIRECTORY_NOT_READABLE = 'directory_not_readable';
    const DIRECTORY_NOT_WRITEABLE = 'directory_not_writeable';
    const DIRECTORY_DOES_NOT_EXIST = 'directory_does_not_exist';

    const CANNOT_GET_INFO = 'cannot_get_info';
    const UNSUPPORTED_TAG_VERSION = 'unsupported_tag_version';
    const UNSUPPORTED_FILE = 'unsupported_file';

    const CANNOT_REMOVE_SONG = 'cannot_remove_song';

    const CANNOT_ADD_ART = 'cannot_add_art';

    const INTERNAL = 'internal';
}
