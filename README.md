<p align="center"><img width="140"src="logo.png"></p>

# Leafplayer

Leafplayer is a minimalistic music streaming server with a focus on performance and a slick UI. It enables you to listen to your private music collection from anywhere in the world.

![01](https://user-images.githubusercontent.com/22923578/115007130-f579e480-9ea9-11eb-9eca-70684a38949a.jpg)

See more [screenshots](#screenshots)

## Installation
### Install using Docker

After installing [Docker](https://docs.docker.com/get-docker/), use the following command to get up and running. Set `APP_SECRET` to a secure, random string. Also, don't forget to adjust the /path/to/your/music directory.

```sh
sudo docker run -d \
  -e "APP_SECRET=supersecret" \
  -v "/path/to/your/music:/music:ro" \
  -v "leafplayer-storage:/var/lib/leafplayer" \
  -p "127.0.0.1:3000:3000" \
  --name leafplayer \
  paulschwoerer/leafplayer
```

You should now see the Leafplayer web interface by navigating to [localhost:3000](http://localhost:3000) in your browser.

To create an initial admin account, run the following command.

```sh
sudo docker exec leafplayer node main.js \
  users:add \
  --username admin \
  --password supersecret
```

You can now add your music directory and start a music scan.

```sh
sudo docker exec leafplayer node main.js \
  library:dir --add /music

sudo docker exec leafplayer node main.js \
  library:scan
```

Note, that the setup above will only allow you to access your Leafplayer instance from your local machine. When deploying a live instance, you should setup a reverse proxy to handle TLS. See for example [Caddy](https://caddyserver.com/) for a simple-to-use solution.

```sh
caddy reverse-proxy --from music.yourdomain.home --to localhost:3000
```

### Install using NodeJS on Linux

Instructions will be added soon.

### Contributing

I'm searching for contributors on this project, hit me up if you're interested.

# Screenshots

![02](https://user-images.githubusercontent.com/22923578/115007273-17736700-9eaa-11eb-91bf-0d3b58c47213.jpg)
![03](https://user-images.githubusercontent.com/22923578/115007279-180bfd80-9eaa-11eb-8cda-f963dd43810f.jpg)
