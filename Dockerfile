FROM node:8
RUN apt-get update

RUN apt-get install -y python-pip python-dev wget
RUN apt-get install -y libzmq3-dev
RUN ldconfig
RUN pip install pyzmq zerorpc gevent==1.1
ENV NPM_CONFIG_PREFIX /home/node/.npm-global
RUN npm install -g gulp-cli
ENV PATH $PATH:/home/node/.npm-global/bin
ENV LD_LIBRARY_PATH $LD_LIBRARY_PATH:/usr/local/lib:/usr/lib
# copy the Restforhead package files
COPY package.json /tmp/app/package.json
RUN cd /tmp/app && npm install
RUN mkdir -p /home/node/app/ && cp -a /tmp/app/node_modules /home/node/app/
# copy the Talk-to-Avatar-admin files
COPY Talk-To-Avatar-Admin/package.json /tmp/talk-to-avatar/package.json
RUN cd /tmp/talk-to-avatar && npm install
RUN mkdir -p /home/node/app/Talk-To-Avatar-Admin/ && cp -a /tmp/talk-to-avatar/node_modules /home/node/app/Talk-To-Avatar-Admin/
# copy the mediasoup-demo files
COPY mediasoup-demo/app/package.json /tmp/mediasoup-demo/app/package.json
RUN cd /tmp/mediasoup-demo/app/ && npm install
RUN mkdir -p /home/node/app/mediasoup-demo/app && cp -a /tmp/mediasoup-demo/app/node_modules /home/node/app/mediasoup-demo/app

WORKDIR /home/node/app/
COPY . /home/node/app

User node
