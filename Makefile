.PHONY: build
build:
	docker build . -t tsenv

setup: build
	cp ./Dockerfile $(project)
	cp ./Makefile $(project)

run:
	docker run -v .:/project -p 8080:8080 --rm --name tsenv tsenv

shell:
	docker run -v .:/project -p 8080:8080 --rm -it tsenv bash

.PHONY: clean
clean:
	docker image rm -f tsenv
