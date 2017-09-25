var mongoose = require('mongoose')
var config = require('./config/config')
var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'silly' })
    // new (winston.transports.File)({ filename: 'log_.log' })
  ]
})
var url = 'mongodb://' + config.mongodb_ip + ':' + config.mongodb_port + '/instances'
var Server = require('./models/Server')
process.title = 'rest_for_head'
mongoose.Promise = global.Promise
mongoose.connect(url, { useMongoClient: true })
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
    logger.log('info', `RTSP server started rtsp://${config.rtspServer.listenIp}:${config.rtspServer.listenPort}`)
  })
  .on('new-source', (source) => {
    let rtspUrl = `rtsp://${config.rtspServer.listenIp}:${config.rtspServer.listenPort}/${source.id}.sdp`
    source.on('enabled', () => {
      logger.log('info', `RTSP source available: ${rtspUrl}`)
    })
  })
process.stdin.resume()

function exitHandler (options, err) {
  if (options.cleanup) {
    // TODO delete files
    logger.log('info', 'Deleting files')
  }
  if (options.exit) process.exit()
}

process.on('SIGINT', exitHandler.bind(null, {exit: true, cleanup: true}))
