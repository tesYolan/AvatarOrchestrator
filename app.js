var mongoose = require('mongoose')
var config = require('./config/config')
var logger = require('./models/Logger')
var url = 'mongodb://' + config.mongodb_ip + ':' + config.mongodb_port + '/instances'
var Server = require('./models/Server')
var Stream = require('node-rtsp-stream')
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
    logger.info(`RTSP server started rtsp://${config.rtspServer.listenIp}:${config.rtspServer.listenPort}`)
  })
  .on('new-source', (source, roomId) => {
    // TODO now, how can we forward this rtsp instance to that of the docker container. The room id
    // is the instance where which must direct this stream to.
    logger.info('room id is %s', roomId)
    let rtspUrl = `rtsp://${config.rtspServer.listenIp}:${config.rtspServer.listenPort}/${source.id}.sdp`
    source.on('enabled', () => {
      logger.info(`RTSP source available: ${rtspUrl}`)
      //       stream = new Stream({
      //        name: roomId,
      //        streamUrl: rtspUrl,
      //        wsPort: 9999
      //      })
    })
  })
  .on('error', (err) => {
    logger.error(err)
  })
process.stdin.resume()

function exitHandler (options, err) {
  if (options.cleanup) {
    // TODO delete files
    logger.info('Deleting files')
  }
  if (options.exit) process.exit()
}

process.on('SIGINT', exitHandler.bind(null, {exit: true, cleanup: true}))
