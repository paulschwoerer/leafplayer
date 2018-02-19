FROM php:7.2.2-fpm

LABEL Maintainer="Paul Schwörer <leafplayer@paulschwoerer.de>" \
Description="LeafPlayer application image"

COPY ./backend /var/www

COPY ./frontend/dist/index.html /var/www/resources/views/index.blade.php

RUN apt-get update && apt-get install -y curl zip unzip git

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

WORKDIR /var/www

RUN touch /var/www/storage/logs/lumen.log

RUN chown -R www-data:www-data /var/www/storage/*

RUN composer install --no-dev

EXPOSE 9000

CMD ["php-fpm"]