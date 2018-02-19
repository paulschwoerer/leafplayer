FROM nginx:1.13.8-alpine

COPY ./deploy/vhost.conf /etc/nginx/conf.d/default.conf

COPY ./backend/public /var/www/public

COPY ./frontend/dist/static /var/www/public/static

CMD ["nginx", "-g", "daemon off;"]