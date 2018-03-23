# setup config files
cp config/config.js mediasoup-demo/app/
# build dockers
docker build . -t node:app
docker build nginx/ -t nginx:latest
