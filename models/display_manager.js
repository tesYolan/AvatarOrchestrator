var zerorpc = require('zerorpc')
// TODO refactor this out. Does this work???
var client = new zerorpc.Client()
client.connect('tcp://127.0.0.1:3111')

/**
 * createDisplay
 *
 * @param name Name of the display to create. For example: instance_name
 * @param numPorts Number of ports free ports the system must return. 
 * @param callback A Zerorpc call back function with signature function(error, res, more). The response holds; [new_display, ports]. new_display is in number. TODO check if also holds ':' as identifier. ports is an array of length specified by numports each holding free ports. 
 * @returns {undefined}
 */
module.exports.createDisplay = function createDisplay (name, numPorts, callback) {
  client.invoke('create_display', name, numPorts, callback)
}
/**
 * stopDisplay
 *
 * @param name The name of the display that must be deleted from the remote pc which holds the system. If the name doesn't exists an error may be raise. But hasn't been dealt with accordingly. 
 * @param callback A zerorpc callback function with signature function(error, res, more). The response contains True to indicate deletion success. 
 * @returns {undefined}
 */
module.exports.stopDisplay = function stopDisplay (name, callback) {
  client.invoke('stop_display', name, callback)
}
