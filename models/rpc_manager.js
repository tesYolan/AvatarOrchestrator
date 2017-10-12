var zerorpc = require('zerorpc')
var config = require('../config/config')

var client = new zerorpc.Client({timeout: (300000), heartbeatInterval: (Number.MAX_VALUE / 2)})

/**
 * createDisplay
 *
 * @param name - name of the docker container
 * @param numPort - the port at which it is listening from outside
 * @param callback - callback with information of the data
 * @returns {undefined}
 */
module.exports.createSession = function createSession (name, numPort, callback) {
  client.connect('tcp://' + config.docker_ip + ':' + numPort)
  client.invoke('create_tmux', {'instance_name': name}, callback)
}

module.exports.stopSession = function stopSession (name, numPort, callback) {
  client.connect('tcp://' + config.docker_ip + ':' + numPort)
  client.invoke('delete_session', {'instance_name': name}, callback)
}
