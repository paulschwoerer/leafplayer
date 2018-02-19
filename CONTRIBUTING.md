# Contributing

### Prerequisites
LeafPlayer recently switched to docker for easier development and deployment. If you don't know about docker, check it out [here](https://www.docker.com/what-docker). It's amazing!

Obviously you need Git to clone the LeafPlayer repository into a directory of your choice.

### Setting up the backend
For the backend it's recommended to use [docker](https://store.docker.com/search?type=edition&offering=community) and [docker-compose](https://docs.docker.com/compose/). It's available for Windows, Linux and Mac.
Of course you can use any other local web server and/or database server, to get going fast however I urge you to use docker for the ease of setting everything up.

After finishing the docker installation, bringing up the backend is merely a question of running two commands in the root folder.

```bash
 $ docker-compose up -d

 $ docker-compose exec app bash bringupdev.sh
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
TODO:

You can place test music into the `testmusic` directory. It will be accessible in the app container via `/var/testmusic`

You can also ssh into the containers app, web or database with `docker exec -it (web|app|database) /bin/bash`

### Troubleshooting

*Problem:* Weird port binding error when running ``docker-compose up -d``

*Solution*: Restart docker

If you're having any issues with the setup process, just pop me a message.
