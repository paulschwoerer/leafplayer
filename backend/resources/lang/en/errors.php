<?php

return [
    /*
     * DEFAULT ERRORS
     */

    'default' => [
        'bad_request' => 'Your request had an error. Please try again.',
        'forbidden' => 'Your request was valid, but you are not authorised to perform that action.',
        'not_found' => 'The endpoint you are looking for was not found.',
        'precondition_failed' => 'Your request did not satisfy the required preconditions.',
        'internal' => 'Something went badly wrong on the server. Please check the server log.',
        'method_not_allowed' => 'This method is not allowed for the API endpoint.',
        'unknown' => 'An unknown error occurred on the server.',
        'unauthorized' => 'You are not authorized to use this endpoint.',
        'too_many_requests' => 'Too many requests were made.',
    ],
    'request' => [
        'validation' => 'Validation of input was not successful.',
    ],
    'library' => [
        'scan_in_progress' => 'A scan is already in progress. Wait till that is finished.',
        'folder_not_added' => 'Folder could not be added.',
        'folder_not_found' => 'Folder with id `:id` was not found.',
        'invalid_folder' => 'Folder name is too long (> 700 characters).',
        'invalid_action' => 'The given action `:action` is not valid',
        'non_existing_directory' => 'The given folder does not exist on the server: `:path`',
        'non_readable_directory' => 'The given folder is not readable: `:path`',
    ],
    'auth' => [
        'no_permission' => 'Permission `:permission` is required to perform this action.',
        'wrong_password' => 'The provided password was not correct for the current user.',
        'invalid_password' => 'The provided password is not valid (must be at least 8 characters, contain numbers and letters).',
        'user_not_found' => 'The current user was not found.',
        'invalid_credentials' => 'Invalid credentials provided.',
        'token_not_provided' => 'No token was provided with the request.',
        'invalid_token_provided' => 'An invalid token was provided with the request.',
        'token_expired' => 'An expired token was provided with the request.',
        'unauthorized' => 'Please login first.',
    ],
    'artist' => [
        'not_found' => 'The artist with id `:id` was not found.',
    ],
    'album' => [
        'not_found' => 'The album with id `:id` was not found.',
    ],
    'song' => [
        'not_found' => 'The song with id `:id` was not found.',
        'file_not_found' => 'File for song `:id` does not exist.',
        'file_not_readable' => 'File for song `:id` is not readable.',
    ],
    'user' => [
        'id_taken' => 'The user with id `:id` already exists.',
        'no_self_delete' => 'You cannot delete yourself. Please contact your administrator to remove your user account.',
        'not_found' => 'The user with id `:id` was not found.',
        'invalid_id' => 'The provided username is invalid (Between 3 and 32 characters, only alphanumeric, dashes and underscores).',
        'exists' => 'A user with this id already exists.',
    ],
    'playlist' => [
        'item_not_found' => 'The item with id `:id` was not found in the playlist.',
        'invalid_order' => 'The submitted structure of the playlist items does not match the playlist structure.',
        'not_found' => 'The playlist with id `:id` was not found.',
        'no_view_permission' => 'You have no permission to view this playlist',
        'no_edit_permission' => 'You have no permission to edit this playlist',
        'no_delete_permission' => 'You have no permission to delete this playlist',
    ],
    'favorites' => [
        'unknown_type' => 'The supplied type `:type` is invalid.',
    ],
    'utility' => [
        'key_not_found' => 'The supplied key `:key` was not found in the .env file.'
    ],
    'setup' => [
        'no_database_connection' => 'No connection to the database could be made.',
        'invalid_credentials' => 'Access for user `:user` was denied.',
        'unknown_database' => 'Database with name `:name` was not found.',
        'unknown_error' => 'An unknown error was encountered, check the server logs for details.'
    ]
];
