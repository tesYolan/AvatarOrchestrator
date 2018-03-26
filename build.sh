# setup config files
cp config/config.js mediasoup-demo/server/
# TODO either the above or the below is wrong.
cp config/config.js mediasoup-demo/app/
# build dockers
docker build . -t node:app
docker build -t nginx:latest -f Dockerfile.nginx 
