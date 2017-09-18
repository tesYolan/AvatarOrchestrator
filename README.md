# Prerequisite Installation
## Mongodb
It's assumed there is a valid mongodb deamon running on the platform. 
1. Installed mongodb from the following link: [installation script](https://docs.mongodb.com/manual/installation/)
2. Set the appropirate ip and port where the deamon is running. Find where the port is configured at the following link: [docs.mongodb.com](https://docs.mongodb.com/manual/tutorial/install-mongodb-enterprise-on-ubuntu/#verify-that-mongodb-has-started-successfully)
..1 If you desire to change the port location.
3. Set the mongodb configuration in the configuration file to the mongodb location. [configuration file](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L8)

# nginx configuration
https://gist.github.com/tesYolan/6ad576b8d3a56eb1cbe5a46005238ed9

Besure to create the respective folders detailed in the rtmp section.

# Configuration
## IP configuration
* Set protoo IP configuration
..* Set IP and port configuration to listen to SIP calls. Values are [link](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L11)
* rstpServer configuration
..* Port where to publish the RSTP server [configure](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L18)
* Change [http port](https://github.com/tesYolan/Restforhead/blob/master/config/config.js#L15) to direct the API calls.
## Docker Configuration

## Install Python Requirements
    cd py-app
    pip install -r requirments.txt

* It's necessary to download the docker image for the HEAD initially.
# How to run

    npm install
    npm start


# TODO 
* Detailed documentation to follow, in the meantime jsdoc enabled doc can be built by invoking
    grunt jsdoc
* Make Misc.py work with the configuration as defined in the [config file](https://github.com/tesYolan/Restforhead/blob/master/config/config.js) file.
* There are a lot of configuration files to be edited and dependecies that need to be installed, if possible creating a script to handle such events would be necessary.
