var mongoose = require('mongoose')

var url = 'mongodb://localhost:27017/instances'
var Server = require('./models/Server')
var config = require('./config/config')
process.title = 'rest_for_head'
mongoose.Promise = global.Promise
mongoose.connect(url)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
// TODO to serve the streams to the different users.
// won't be used when the ngix server is being not used.
const server = new Server()
server.listen({})

const RtspServer = require('mediasoup-server').RtspServer
const rtspServer = new RtspServer(server)
rtspServer
  .listen(config.rtspServer.listenPort)
  .on('listen', (port) => {
    console.log(`RTSP server started rtsp://${config.rtspServer.listenIp}:${config.rtspServer.listenPort}`)
  })
  .on('new-source', (source) => {
    let rtspUrl = `rtsp://${config.rtspServer.listenIp}:${config.rtspServer.listenPort}/${source.id}.sdp`
    source.on('enabled', () => {
      console.log(`RTSP source available: ${rtspUrl}`)
    })
  })
process.stdin.resume()

function exitHandler (options, err) {
  if (options.cleanup) {
    // TODO delete files
    console.log('Deleting files')
  }
  if (options.exit) process.exit()
}

process.on('SIGINT', exitHandler.bind(null, {exit: true, cleanup: true}))
