FROM php:7.2.2-fpm

RUN apt-get update && apt-get install -y curl zip unzip

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

RUN docker-php-ext-configure pdo_mysql --with-pdo-mysql=mysqlnd
RUN docker-php-ext-install \
    mbstring \
    pdo_mysql

WORKDIR '/var/www'

EXPOSE 9000

CMD ["php-fpm"]