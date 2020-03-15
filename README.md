<p align="center"><img width="140"src="logo.png"></p>

**Unfortunately, this project is put on ice for now.**

# LeafPlayer

LeafPlayer is a simple and fast, privately hosted music streaming server. It enables you to access your private music collection from anywhere where there's internet access.

## Screenshot

<p align="center"><img width="80%" src="demo.png"></p>

## Installation

There are currently two methods to install LeafPlayer.

### Using Docker

If you haven't heard about Docker, check it out [here](https://www.docker.com/what-docker). It's amazing!
Prerequisites for using this method are to have [Docker](https://store.docker.com/search?type=edition&offering=community) and [docker-compose](https://docs.docker.com/compose/) installed.

After that everything is fairly simple. Just grab the `docker-compose.yml` and `.env` file from the `dist` directory and copy them to a location of your choice on your server.

Open the `.env` file and edit the following values

- `APP_KEY`: Replace with a random 32 character string.
- `JWT_KEY`: Same as above.
- `APP_TIMEZONE`: Change to your desired timezone. See [http://php.net/manual/en/timezones.php](http://php.net/manual/en/timezones.php) for a full list. 
- `DB_PASSWORD`: Change to something else if desired.
- `HTTP_PORT`: The http port, that LeafPlayer should run on.
- `HTTPS_PORT`: The https port, that LeafPlayer should run on.
- `CERT_CHAIN`: Absolute path to your SSL certificate file
- `CERT_KEY`: Absolute path to your SSL key file
- `MUSIC_DIR`: Absolute path to your music files

After that just run `docker-compose up -d`.

### Not Using Docker (The old school method)

You'll need to own a server or computer, capable of running the [Lumen PHP framework](https://lumen.laravel.com/) and a supported database, for example MySQL. Those requirements are the following:

- Webserver
- PHP >= 5.6.4
- OpenSSL PHP Extension
- PDO PHP Extension
- Mbstring PHP Extension
- [Composer](https://getcomposer.org/)

Simply grab the latest [release](https://github.com/paulschwoerer/leafplayer/releases) and copy the contents into your desired folder.

You'll also need a database dedicated to your LeafPlayer installation.

```bash
 $ composer install

 $ php artisan lp:setup
```
 
After the installer has finished successfully, you should be able to log in with the admin account you just created.

- Note, that LeafPlayer is currently best suited to live at the root of a domain, so `example.com` or `leafplayer.example.com` but not in a subdirectory like `example.com/leafplayer`. If you need to deploy it to a subdirectory however, scroll down to the `Advanced` section.
- The installer is currently being tested, so please let me know if any problems arise from using it.

## Usage

### Adding Media

For LeafPlayer to be useful, it obviously needs some music. In the administration panel you can add folders, which will then be scanned for mp3 files when starting a scan. In the future other file formats will be supported as well.  
It's also possible to manage your collection from the console by using the scanner commands.

(All commands must be prefixed with `php artisan `)

- `lp:library:folder:add {path}` Adds a folder to scan for files.
- `lp:library:folder:remove {id}` Removes a folder by its ID.
- `lp:library:folder:list` Lists all folders that are used for scanning.
- `lp:library:scan {--no-output}` Starts a scan for media in the earlier specified folders.
- `lp:library:clean {--no-output}` Cleans the database from missing files.
- `lp:library:wipe {--confirm} {--no-output}` Deletes all media information from the database. Use with care.

### Adding Users

Users can be added in the "Users" tab of the administration panel. Currently it's only possible to add users with default permissions.

## Upgrading

### Using Docker

Just pull the newest image and restart the containers.

```bash
 $ docker-compose pull
 
 $ docker-compose up -d
```

### Not using Docker

There is no command to upgrade to a newer release. Currently it's a matter of replacing all files except of the `.env` file and the `public/artwork` folder.

## A Short History

In late 2016 I was searching for a music streaming server to fit my needs, but none of the available alternatives could really satisfy me, which is why I decided to create my own.

> How hard can it be?

As it turned out, it was - and still is - a lot of work for a single person, which is why I'm searching for active contributors for the project to create something amazing.

## Contributing

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more info.

## Advanced

### Deploying into subdirectory
There's two things that you need to do.
- Rebuild the frontend with the following command (See [CONTRIBUTING.md](CONTRIBUTING.md) for more details on how to build the project)

  ```sh
  $ node build/build.js --base=/YOUR_BASE_URL/
  ```
- Edit the `.htaccess` file in the `public` directory and add your subdirectory to the `RewriteBase` argument.
  ```htaccess
  RewriteBase /YOUR_BASE_URL/
  ```
