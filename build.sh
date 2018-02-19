#!/usr/bin/env bash

cd frontend

npm run build

cd ..

docker build -t paulschwoerer/leafplayer-app -f ./app.dockerfile .

docker build -t paulschwoerer/leafplayer-web -f ./web.dockerfile .