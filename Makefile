.PHONY: build
build:
	docker build . -t tsenv

setup: build
	cp ./Dockerfile $(project)
	cp ./Makefile $(project)

run:
	docker run -v .:/project -p 8080:8080 --rm --name tsenv tsenv

stop:
	docker kill tsenv

shell:
	docker run -v .:/project -p 8080:8080 --rm -it tsenv bash

town:
	docker run -v .:/project -p 8080:8080 --rm tsenv node src/scripts/parseMap.js src/data/town.txt src/data/town.json

.PHONY: clean
clean:
	docker image rm -f tsenv
