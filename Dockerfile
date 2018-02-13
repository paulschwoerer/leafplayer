# base image
FROM composer:1.6.3

LABEL Maintainer="Paul Schwörer <leafplayer@paulschwoerer.de>" \
Description="LeafPlayer all-in-one image"

# install nginx
RUN apk update && apk add \
    nginx \
    openrc \
    mysql \
    mysql-client

# Create app directory
RUN mkdir -p /app

# Copy mysql configs
COPY ./deploy/mysql/my.cnf /etc/mysql/my.cnf
COPY ./deploy/mysql/initmysql.sh /app/initmysql.sh

# Copy nginx configs
COPY ./deploy/nginx/nginx.conf /etc/nginx/nginx.conf
ADD ./deploy/nginx/nginx-default.conf /etc/nginx/conf.d/default.conf

# Add programs to auto start
RUN rc-update add nginx default
#RUN rc-update add mysql default

# remove default httpdocs directory
RUN rm -rf /vr/www/localhost

ADD ./backend /var/www

WORKDIR /var/www

EXPOSE 80

CMD ["/app/initmysql.sh"]
