#!/bin/bash

dos2unix ./deploy/entry.app.sh

cd frontend

npm run build

cd ..

docker build -t paulschwoerer/leafplayer-app -f ./app.dockerfile . --build-arg composer_args="install --no-dev"

docker build -t paulschwoerer/leafplayer-web -f ./web.dockerfile .

docker push paulschwoerer/leafplayer-app

docker push paulschwoerer/leafplayer-web