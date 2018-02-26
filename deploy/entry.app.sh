#!/bin/sh

chown -R www-data:www-data /var/www/storage /var/music

set -e

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- php-fpm "$@"
fi

exec "$@"