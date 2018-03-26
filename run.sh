#!/bin/bash
export MONGO_IP=localhost 
export MONGO_PORT=27017 
export DOCKER_IP=localhost 
export DOCKER_IMAGE=hanson:latest
export STREAM_IP=localhost
export STREAM_PORT=5443
export PROTOO_IP=0.0.0.0
export PROTOO_PORT=3443
export HTTP_IP=localhost
export HTTP_PORT=3011
export HTTPS_IP=localhost
export HTTPS_PORT=3443
export RTMP_IP=localhost
export RTMP_PORT=5442
export RESOLUTION_WIDTH=1366
export RESOLUTION_HEIGHT=768
export RPC_IP=0.0.0.0
export RPC_PORT=3111
export RTP_AUDIO_IP=localhost
export RTP_AUDIO_PORT=5002
export RTP_VIDEO_IP=localhost
export RTP_VIDEO_PORT=5005

# Run the code.
npm run deploy
