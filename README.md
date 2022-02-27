<p align="center"><img width="256"src="https://user-images.githubusercontent.com/22923578/137105016-a7402b45-8e82-44d7-acff-84fc875c6212.png"></p>

<p align="center">
    <a href="#features">Features</a> | 
    <a href="#installation">Installation</a> | 
    <a href="#usage">Usage</a> | 
    <a href="#screenshots">Screenshots</a>
</p>

<p align="center">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/paulschwoerer/leafplayer/build">
  <img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/paulschwoerer/leafplayer">
  <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/paulschwoerer/leafplayer">
</p>



<p align="center"><b>Looking for contributors!</b> <a href="mailto:hello@paulschwoerer.de">Hit me up</a> if you're interested.</p>

Leafplayer is a minimalistic music streaming server with a focus on performance and a slick UI. It enables you to listen to your private music collection from anywhere in the world.

![01](https://user-images.githubusercontent.com/22923578/115007130-f579e480-9ea9-11eb-9eca-70684a38949a.jpg)

## Features

These are some notable features, in no particularly order.

* Modern, mobile-friendly interface
* Native media controls
* Artworks from media tags for artists and albums  
* Multiple user accounts
* Registration of accounts using invite codes
* Fast search
* Night mode

## Installation

### With Docker

Use the following command to get up and running quickly. Don't forget to replace `supersecret` with a secure, random string and adjust the `/path/to/your/music` directory.

```sh
docker run -d \
  -e "APP_SECRET=supersecret" \
  -v "/path/to/your/music:/music:ro" \
  -v "leafplayer-storage:/var/lib/leafplayer" \
  -p "127.0.0.1:3000:3000" \
  --name leafplayer \
  paulschwoerer/leafplayer
```

You should now see the Leafplayer web interface by navigating to [localhost:3000](http://localhost:3000) in your browser.

### Without Docker (Linux only)

You need to have a working install of [NodeJS](https://nodejs.org/en/download/) >= v14.17.

```sh
# check your node version
node --version
```

After that, grab the latest Leafplayer release from the [releases page](https://github.com/paulschwoerer/leafplayer/releases) and extract it into a directory of your choice, for example `/opt/leafplayer`.

```sh
# specify the version to use
LP_VERSION="1.0.0"

# specify the Leafplayer directory
LP_DIRECTORY="/opt/leafplayer"

# specify a user to run Leafplayer as
LP_USER="lpuser"

# add the user
adduser "$LP_USER"

# create the Leafplayer directory
sudo mkdir "$LP_DIRECTORY"

# download the specified release
wget -P /tmp "https://github.com/paulschwoerer/leafplayer/releases/download/v$LP_VERSION/leafplayer-v$LP_VERSION.zip"

# unzip release
sudo unzip -q "/tmp/leafplayer-v$LP_VERSION.zip" -d "$LP_DIRECTORY"

# give the Leafplayer user permission to write to the directory
sudo chown -R $LP_USER "$LP_DIRECTORY"

# install dependencies
cd "$LP_DIRECTORY" && npm install

# finally, remove downloaded file
rm "/tmp/leafplayer-v$LP_VERSION.zip"
```

Leafplayer will use `/var/lib/leafplayer` as its storage directory. Make sure it exists and that the user account, which will run Leafplayer, owns it.

```sh
sudo mkdir /var/lib/leafplayer

chown "$LP_USER" /var/lib/leafplayer
```

Finally, start the server. Don't forget to replace `supersecret` with a secure, random string.

```sh
cd "$LP_DIRECTORY"

NODE_ENV=production APP_SECRET=supersecret node main.js serve
```

You should now see the Leafplayer web interface by navigating to [localhost:3000](http://localhost:3000) in your browser.

### Reverse Proxy

Note, that the setup above will only allow you to access your Leafplayer instance from your local machine. When deploying a live instance, you should setup a reverse proxy to handle TLS. See for example [Caddy](https://caddyserver.com/) for a simple-to-use solution.

```sh
caddy reverse-proxy --from music.yourdomain.home --to localhost:3000
```

## Usage

If you followed the docker instructions, prefix the following commands as follows.

```sh
sudo docker exec leafplayer node main.js ...
```

To create an initial admin account, run the following command.

```sh
node main.js users:add \
  --username admin \
  --password supersecret
```

You can now add your music directory and start a music scan.

```sh
node main.js library:dir --add /music

node main.js library:scan
```

## Screenshots

![Desktop 1](https://user-images.githubusercontent.com/22923578/115007273-17736700-9eaa-11eb-91bf-0d3b58c47213.jpg)
![Desktop 2](https://user-images.githubusercontent.com/22923578/115007279-180bfd80-9eaa-11eb-8cda-f963dd43810f.jpg)
![Night Mode](https://user-images.githubusercontent.com/22923578/138750415-a94988b4-cc45-4d24-9543-a26c164c4cb6.jpg)
![Mobile](https://user-images.githubusercontent.com/22923578/137108444-ef15701c-0e1e-4177-a9c5-fba3216b9db0.jpg)
