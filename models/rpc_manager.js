var zerorpc = require('zerorpc')
var config = require('../config/config')

var client = new zerorpc.Client({timeout: (300000), heartbeatInterval: (Number.MAX_VALUE / 2)})

/**
 * createDisplay - Goes to zerorpc server which handles the starting of the stack from inside the docker.This DOESN'T create the container. It assumes there is a container that is started and listening on valid RPC port it is currently hearing on.
 *
 * @param name - name of the docker container
 * @param numPort - the port at which it is listening from host perspective in docker sense
 * @param callback - callback with information of the data
 * @returns {undefined}
 */
module.exports.createSession = function createSession (name, numPort, callback) {
  client.connect('tcp://' + 'localhost' + ':' + numPort)
  client.invoke('create_tmux', {'instance_name': name}, callback)
}

/**
 * stopSession - Goest to zerorpc server which handles the stopping of the stack from inside the docker. This DOESN'T remove the container. It assumes there is a container that is started and listening on a valid RPC port it is going to setup zerorpc on.
 *
 * @param name - name of the docker container
 * @param numPort - the port at which it is listening from host perspective in docker sense.
 * @param callback - callback with information of the data
 * @returns {undefined}
 */
module.exports.stopSession = function stopSession (name, numPort, callback) {
  client.connect('tcp://' + 'localhost' + ':' + numPort)
  client.invoke('delete_session', {'instance_name': name}, callback)
}

/**
 * sdpSession - transmitts the sdp configuration
 * @param name - the type of the parameter that is either audio or video
 * @param numPort - the port at which it is listening from host perspective in docker sense.? 
 * @param callback - callback with information about the invocation.
 */
module.exports.sdpSession = function sdpSession (type, numPort, callback) {
  client.connect('tcp://' + 'localhost' + ':' + numPort)
  client.invoke('sdp_description', {'mediaType': type}, callback)
}
