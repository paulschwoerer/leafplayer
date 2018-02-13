FROM nginx:1.13.8-alpine

ADD ./deploy/vhost.conf /etc/nginx/conf.d/default.conf