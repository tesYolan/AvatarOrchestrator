var zerorpc = require('zerorpc')
// TODO refactor this out. Does this work???
var client = new zerorpc.Client()
client.connect('tcp://127.0.0.1:3111')

module.exports.create_display = function create_display (name, num_ports, callback) {
  client.invoke('create_display', name, num_ports, callback)
}
module.exports.stop_display = function stop_display (name, callback) {
  client.invoke('stop_display', name, callback)
}
