FROM nginx:1.13.8-alpine

COPY ./deploy/vhost.dev.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]