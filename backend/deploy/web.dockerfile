FROM nginx:1.10

ADD ./deploy/vhost.conf /etc/nginx/conf.d/default.conf
WORKDIR /var/www