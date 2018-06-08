# Easy Installation
Be sure to have [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/#install-compose) are installed.
* Unfortunately we need to install local dependencies for now, otherwise different libraries may not be found. Thus a user even if they may opt not to use on their system, installing packages is needed
```
git clone --recursive https://github.com/tesyolan/Restforhead.git
cd Restforhead
npm install
./build.sh
```
* To run, which would require promopt for password to set permission for `docker.sock`: 
```
./run-docker.sh
```

# Manual Installation
## Prerequisite installation
* Be sure to have [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/#install-compose) are installed.
* Install [mongo](https://docs.mongodb.com/manual/installation/)
* And [nginx](https://nginx.org/en/docs/install.html) with [nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module.git), http_ssl_module, http_stub_status_module. You could follow the instruction outlined below.
### Nginx Installation
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

#### nginx configuration
There is a sample configuration in [nginx](nginx/nginx.conf) folder in this repository
* Be sure to create the respective folders detailed in the rtmp section.
#### Start the service
```
sudo service nginx start
```
* If errors come up when starting the service diagnose with:
```
systemctl status nginx.service # or relevant commands
```
#### Install Python Requirements
    cd py-app
    pip install -r requirments.txt
#### Download the docker images which build HR stack.
    ./get_docker_images.sh

This above links point a valid, tested environment that works with this particular stack. One can manually point different applications with the tool also.
## Installing the app
After having installed the prerequisites, you can set up the environment with the following lines. 
    git clone --recursive https://github.com/tesYolan/Restforhead.git
    npm install # This recursively installs the dependencies requirements for each submodule.
    sudo chmod 777 /var/run/docker.sock
    npm run deploy # Include everthing.

* NOTE: this had been tested on ubuntu environment primarily. MacOS and other setups may not go as smoothly. If you encounter an issue feel free to file an [issue](https://github.com/tesyolan/Restforhead/issues/newissue).
# Configuration of the App
## IP configuration
* Change [appropriate configuration in](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L15) to direct the API calls.
## Docker Configuration
* It's necessary to download the docker image for the HEAD initially.
* It's necessary the image names being used are up available.
## Important Functionalities that remain. 
* More dockerization of the application to make any one use it. We can utilize the nginx container for native usage as it largely isn't needed besides relaying requests.
* Create consumer for RTP streams for audio/video. 
## Other Goals.
* Detailed documentation to follow, in the meantime jsdoc enabled doc can be built by invoking
    grunt jsdoc
* Make Misc.py work with the configuration as defined in the [config file](https://github.com/tesYolan/Restforhead/blob/master/config/config.js) file.
# Tests
* More comprehensive tests. Currently their are tests to check validity of routes and their respective functionalities. 
```
    npm test # to run tests.
```
