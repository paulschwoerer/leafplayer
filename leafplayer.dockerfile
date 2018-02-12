# base image
FROM ubuntu

# install needed extensions
RUN apt-get update -y && apt-get install -y openssl zip unzip git curl

# install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# needed mbstring php extension
# RUN docker-php-ext-install pdo mbstring

WORKDIR ../

ADD deploy /app

#RUN composer install

CMD service apache2 start
CMD service mysql start

EXPOSE 80
EXPOSE 443

