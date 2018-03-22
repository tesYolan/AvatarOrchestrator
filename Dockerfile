FROM node:8
RUN apt-get update

RUN apt-get install -y python-pip python-dev wget
RUN apt-get install -y libzmq3-dev
RUN ldconfig
RUN pip install xvfbwrapper pyzmq zerorpc
ENV NPM_CONFIG_PREFIX /home/node/.npm-global
RUN npm install -g gulp-cli
ENV PATH $PATH:/home/node/.npm-global/bin
ENV LD_LIBRARY_PATH $LD_LIBRARY_PATH:/usr/local/lib:/usr/lib
