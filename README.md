# Prerequisite Installation
## Hanson Pipeline docker container.
Here, the steps are outlined to setup a docker container using a hrtool [hrtool](https://github.com/hansonrobotics/hrtool)
* Build with hrtool in docker container. 
* Run the container and utilize the following steps for enabling RPC in docker container. (This work hasn't been merged in the pipeline yet).
```
    # go to hr_launchpad 
    git pull remote git@github.com:tesYolan/hr_launchpad.git
    git checkout remote master
```
* In addition to that docker builder need to bundle [virtualgl](https://virtualgl.org/vgldoc/2_2_1/#hd004001) in the docker image. 
* If utilizing nvidia-docker one needs to link X path's of the host to docker image as nvidia-docker has yet to connect them both.
## Mongodb
It's assumed there is a valid mongodb deamon running on the platform. 
1. Installed mongodb from the following link: [installation script](https://docs.mongodb.com/manual/installation/)
2. Set the appropirate ip and port where the deamon is running. Find where the port is configured at the following link: [docs.mongodb.com](https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/#verify-that-mongodb-has-started-successfully)
..1 If you desire to change the port location.
3. Set the mongodb configuration in the configuration file to the mongodb location. [configuration file](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L8)

## FFMPEG
Since we do screen casting it's necessary the `FFMPEG` environmental variable points to a valid ffmpeg executable. For instance one can actually do the following to setup static build to be used. Note, as long as the ``FFMPEG`` is set to ffmpeg executable or ffmpeg is path , you don't need to setup using the following way.
```
cd ~/
wget https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-64bit-static.tar.xz
tar -xf ffmpeg-git-64bit-static.tar.xz 
# the version that is extracted may be different in your case as such point to different folder.
cd ffmpeg-git-20170919-64bit-static/
echo "export FFMPEG=$pwd/ffmpeg" | tee -a ~/.bashrc
```


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
sudo make install
```
Add entry to service for the system save to /lib/systemd/system/nginx.service
```
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=syslog.target network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
# for fedora systems
# PIDFile=/run/nginx.pid
# for ubunut
PIDFile=/var/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```
There may be issue installing this, there needs to be resolution of this going forward. 

### nginx configuration
After having installed the nginx with rtmp module, one can configure the desired parameters as follows. Note: This has to be reflected in the config file in this module. 
https://gist.github.com/tesYolan/6ad576b8d3a56eb1cbe5a46005238ed9

### Start the service
```
sudo service nginx start
```

* Besure to create the respective folders detailed in the rtmp section.
* If errors come up when starting the service diagnose with:
```
systemctl status nginx.service 
```

# Configuration
## IP configuration
* Set protoo IP configuration
..* Set IP and port configuration to listen to SIP calls. Values are [link](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L11)
* rstpServer configuration
..* Port where to publish the RSTP server [configure](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L18)
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
* Better FPS performance of the application. 
* Better SDP performance when decoding the stream. 
## Other Goals.
* Detailed documentation to follow, in the meantime jsdoc enabled doc can be built by invoking
    grunt jsdoc
* Make Misc.py work with the configuration as defined in the [config file](https://github.com/tesYolan/Restforhead/blob/master/config/config.js) file.
* More comperhensive test. Currently their are tests to check validity of routes and their respective functionalities. 
    npm test # to run tests.
