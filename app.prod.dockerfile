# Use alpine image for smaller final image size
FROM php:7.2.2-fpm-alpine3.7

LABEL Maintainer="Paul Schwörer <leafplayer@paulschwoerer.de>" \
Description="LeafPlayer application image"

# Install needed dependencies
RUN apk update && apk add curl zip unzip git \
    # Install and configure needed php extensions
    && docker-php-ext-configure pdo_mysql --with-pdo-mysql=mysqlnd \
    && docker-php-ext-install \
    mbstring \
    pdo_mysql \
    # Install composer TODO: can be optimized by not shipping it with production image
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

# Set workdir
WORKDIR /var/www

# Copy composer files
COPY ./backend/composer.json /var/www/composer.json
COPY ./backend/composer.lock /var/www/composer.lock

# Install dependencies
RUN composer install --no-dev

# copy backend files (restricted by .dockerignore)
COPY ./backend /var/www

# Copy frontend index.html to lumen view
COPY ./frontend/dist/index.html /var/www/resources/views/index.blade.php

# Create and set permissions on app files and music directory
RUN touch /var/www/storage/logs/lumen.log \
    && mkdir /var/music

# Copy entrypoint script
COPY ./deploy/entry.app.sh /usr/bin/entrypoint.sh

# Set entrypoint script permissions
RUN chmod +x /usr/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD ["php-fpm"]