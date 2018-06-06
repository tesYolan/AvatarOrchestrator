# Easy Installation
Be sure to have [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/#install-compose) are installed.
* Unfortunately we need to install local dependencies for now, otherwise different libraries may not be found. Thus a user even if they may opt not to use on their system, installing packages is needed
```
git clone --recursive https://github.com/tesyolan/Restforhead.git
cd Restforhead
npm install
./build.sh
docker-compose up
```
# Manual Installation
* Install docker and docker-compose
* Install mongo
* Install docker

## Nginx Installation
```
cd ~/
# first clone rtmp module
git clone https://github.com/arut/nginx-rtmp-module.git
wget http://nginx.org/download/nginx-1.12.1.tar.gz
tar -xf nginx-1.12.1.tar.gz
cd nginx-1.12.1/ 
# Note both ssl module and stub status are enabled.
./configure --add-module=../nginx-rtmp-module --with-http_ssl_module --with-http_stub_status_module
make -j`nproc`
make install # or use sudo
```

### nginx configuration
There is a sample configuration in nginx folder in this repository
### Start the service
```
sudo service nginx start
```

* Be sure to create the respective folders detailed in the rtmp section.
* If errors come up when starting the service diagnose with:
```
systemctl status nginx.service # or relevant commands
```

# Configuration
## IP configuration
* Change [http port](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L15) to direct the API calls.
## Docker Configuration


* It's necessary to download the docker image for the HEAD initially.
# How to install
    git clone --recursive https://github.com/tesYolan/Restforhead.git
    npm install # This recursively installs the dependencies requirements for each submodule.
    npm run deploy # Include everthing.

## Install Python Requirements
    cd py-app
    pip install -r requirments.txt

## Important Functionalities that remain. 
* More dockerization of the application to make any one use it
* Create consumer for RTP streams for audio/video in a way that is much much better. 
## Other Goals.
* Detailed documentation to follow, in the meantime jsdoc enabled doc can be built by invoking
    grunt jsdoc
* Make Misc.py work with the configuration as defined in the [config file](https://github.com/tesYolan/Restforhead/blob/master/config/config.js) file.
* More comprehensive tests. Currently their are tests to check validity of routes and their respective functionalities. 
```
    npm test # to run tests.
```
