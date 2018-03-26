# setup config files
cp config/config.js mediasoup-demo/server/
# build dockers
docker build . -t node:app
docker build -t nginx:latest -f Dockerfile.nginx 
