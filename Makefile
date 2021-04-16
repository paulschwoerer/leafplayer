PROJECT = "Leafplayer"

build: ;@echo "Building ${PROJECT}";
	npm ci --quiet;
	cd ./web && npm ci --quiet;
	npm run build;
	cd ./web && npm run build;
	mv ./web/build ./build/public;
