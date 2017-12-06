<p align="center"><img width="140"src="logo.png"></p>

# LeafPlayer

LeafPlayer is a simple and fast, privately hosted music streaming server. It enables you to access your private music collection from anywhere where there's internet access.

## Demo
There is a demo available at [https://leafplayerdemo.paulschwoerer.de](https://leafplayerdemo.paulschwoerer.de).

- Username: demo1 / demo2
- Password: demodemo123

Try dragging albums, artists and songs onto the player and the playlists in the sidebar.

The ability to change password and download songs are removed from the demo.

<p align="center"><img width="80%" src="demo.png"></p>

## Quick start

To use LeafPlayer, you need to own a server, capable of running the [Lumen PHP framework](https://lumen.laravel.com/) and a supported database, for example MySQL. You can use your home computer as well in case you only want to listen to music in your home network. To access the frontend you need a modern browser (for example Firefox, Chrome, Safari).

### Installation
To install LeafPlayer on your server or computer, simply grab the latest [release](https://github.com/paulschwoerer/leafplayer/releases) and copy the contents to yur web root.
Make sure your server meets the following requirements:

- Webserver
- PHP >= 5.6.4
- OpenSSL PHP Extension
- PDO PHP Extension
- Mbstring PHP Extension
- [Composer](https://getcomposer.org/)

You also need a working database server, preferably with a user and a database dedicated to your LeafPlayer installation.

If your server meets those requirements, you're ready to start the setup process and follow the instructions provided by the installer.

```sh
composer install

php artisan lp:setup
```
 
After the installer has finished successfully, you should be able to log in with the admin account you just created.

- Note, that LeafPlayer can currently only live at the root of a domain, so `example.com` or `leafplayer.example.com` but not in a subdirectory like `example.com/leafplayer`.
- The installer is currently being tested, so please let me know if any problems arise from using it.

### Adding Media

For LeafPlayer to be useful, it obviously needs some music. In the administration panel you can add folders, which will then be scanned for mp3 files when starting a scan. In the future other file formats will be supported as well.  
It's also possible to manage your collection from the console by using the scanner commands.

(All commands must be prefixed with `php artisan `)

- `scanner:folder:add {path}` Adds a folder to scan for files.
- `scanner:folder:remove {id}` Removes a folder by its ID.
- `scanner:folder:list` Lists all folders that are used for scanning.
- `scanner:scan {--clean} {--no-progress} {--update-existing}` Starts a scan for media in the earlier specified folders.
- `scanner:clean {--no-progress}` Cleans the database from missing files.
- `scanner:clear {--confirm} {--remove-playlists} {--no-progress}` Deletes all media information from the database. Use with extreme care.

### Adding Users

Users can be added in the "Users" tab of the administration panel. Currently it's only possible to add users with default permissions.

### Upgrading

There is currently no command to upgrade to a newer release. Currently it's a matter of replacing all files except of the `.env` file.

## A Short History

In late 2016 I was searching for a music streaming server to fit my needs, but none of the available alternatives could really satisfy me, which is why I decided to create my own.

> How hard can it be?

As it turned out, it was - and still is - a lot of work for a single person, which is why I'm searching for active contributors for the project to create something amazing.


## Contributing

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more info.
