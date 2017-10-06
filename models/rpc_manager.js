var zerorpc = require('zerorpc')

var client = new zerorpc.Client()

/**
 * createDisplay
 *
 * @param name - name of the docker container
 * @param numPort - the port at which it is listening from outside
 * @param callback - callback with information of the data
 * @returns {undefined}
 */
module.exports.createSession = function createSession (name, numPort, callback) {
  client.connect('tcp://127.0.0.1:' + numPort)
  client.invoke('create_tmux', {'instance_name': name}, callback)
}

module.exports.stopSession = function stopSession (name, numPort, callback) {
  client.connect('tcp://127.0.0.1:' + numPort)
  client.invoke('delete_session', {'instance_name': name}, callback)
}
