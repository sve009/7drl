FROM debian:latest

WORKDIR /project
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs \
    npm
VOLUME /project

CMD npx webpack serve
