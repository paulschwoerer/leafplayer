FROM php:7.2.2-fpm-alpine3.7

RUN apk update && apk add \
    libmcrypt-dev \
    mysql-client
&& docker-php-ext-install mcrypt pdo_mysql