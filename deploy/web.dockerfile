FROM nginx:1.13.8-alpine

COPY ./deploy/vhost.conf /etc/nginx/conf.d/default.conf