# Contributing

### Prerequisites
LeafPlayer recently switched to docker for easier development and deployment. If you haven't heard about docker, check it out [here](https://www.docker.com/what-docker). It's amazing!

Obviously you need Git to clone the LeafPlayer repository into a directory of your choice.

### Setting up the backend
For the backend it's recommended to use [docker](https://store.docker.com/search?type=edition&offering=community) and [docker-compose](https://docs.docker.com/compose/). It's available for Windows, Linux and Mac.
Of course you can use any other local web server and/or database server, to get going fast however I urge you to use docker for the ease of setting everything up.

After finishing the docker installation, bringing up the backend is merely a question of running two commands in the root folder.

```bash
 $ docker-compose up -d

 $ docker-compose exec app ./bringupdev
```

### Setting up the frontend

For the frontend you'll need NodeJS with the npm package manager.

- [NodeJS](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/) (usually ships with NodeJS)

The frontend is based on the [VueJS webpack template](https://github.com/vuejs-templates/webpack). So getting it running is merely a question of running the following commands from the `frontend` directory:

```bash
 $ npm install

 $ npm run dev
```

### Usage

You can place music files into the `testmusic` directory for testing. It will be accessible in the app container via `/var/music`

You can also ssh into the app or web container with `docker exec -it (web|app) /bin/sh`

A [phpmyadmin](https://www.phpmyadmin.net/) instance will be available at http://localhost:8081 for easy database debugging.
