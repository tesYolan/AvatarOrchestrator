var mongoose = require('mongoose')

var url = 'mongodb://localhost:27017/instances'
var Server = require('./models/Server')

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
  .listen(5000)
  .on('listen', (port) => {
    console.log(`RTSP server started rtsp://192.168.1.48:${port}`)
  })
  .on('new-source', (source) => {
    let rtspUrl = `rtsp://192.168.1.48:${rtspServer.port}/${source.id}.sdp`
    source.on('enabled', () => {
      console.log(`RTSP source available: ${rtspUrl}`)
    })
  })
