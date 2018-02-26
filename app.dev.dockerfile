FROM php:7.2.2-fpm-alpine3.7

RUN apk update && apk add curl zip unzip

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

RUN docker-php-ext-configure pdo_mysql --with-pdo-mysql=mysqlnd \
    && docker-php-ext-install \
    mbstring \
    pdo_mysql

WORKDIR '/var/www'

# Copy entrypoint script
COPY ./deploy/entry.app.sh /usr/local/bin/leafplayer-entrypoint

# Set entrypoint script permissions
RUN chmod +x /usr/local/bin/leafplayer-entrypoint

EXPOSE 9000

ENTRYPOINT ["leafplayer-entrypoint"]
CMD ["php-fpm"]