# LeafPlayer Backend

> Backend for the LeafPlayer personal music streaming server.

## Contributing

It is recommended to install [Docker](https://www.docker.com/) for a pleasant and consistent development experience. Of course any web server with PHP support will do as well.

If you decided to use docker, getting started is simply a manner of running the following commands.
```
# Move into backend directory
cd backend

# Install dependencies
composer install

# Rename .env.example to .env
mv .env.example .env

# Generate app secret
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Start the development server
docker-compose up -d

# Create tables in database
php artisan migrate

# Seed database with development users
php artisan db:seed
```

Happy coding!

## Known issues

- On Windows, the backend has problems with file names containing special characters like `, ä, ñ, ...
