FROM nginx:1.13.9-alpine

# Copy nginx vhost configuration
COPY deploy/vhost.prod.conf /etc/nginx/conf.d/default.conf

COPY ./backend/public /var/www/public

COPY ./frontend/dist/static /var/www/public/static

EXPOSE 80