var express = require('express')
var mongoose = require('mongoose')
var path = require('path')
var logger = require('morgan')
var url_ = require('url')
var bodyParser = require('body-parser')
var https = require('https')
var cors = require('cors')
var instanceRouter = require('./routes/routesInstance')
var configurationRouter = require('./routes/routesConfiguration')
var app = express()
var config = require('./config/config')
var Room = require('./models/Room')
var mediasoup = require('mediasoup')
var fs = require('fs')
var protooServer = require('protoo-server')

let rooms = new Map()

let mediaServer = mediasoup.Server({
  numWorkers: 1,
  logLevel: config.mediasoup.logLevel,
  logTags: config.mediasoup.logTags,
  rtcIPv4: config.mediasoup.rtcIPv4,
  rtcIPv6: config.mediasoup.rtcIPv6,
  rtcAnnouncedIPv4: config.mediasoup.rtcAnnouncedIPv4,
  rtcAnnouncedIPv6: config.mediasoup.rtcAnnouncedIPv6,
  rtcMinPort: config.mediasoup.rtcMinPort,
  rtcMaxPort: config.mediasoup.rtcMaxPort
})

global.SERVER = mediaServer

mediaServer.on('newroom', (room) => {
  global.ROOM = room
})
let tls = {
  cert: fs.readFileSync(config.tls.cert),
  key: fs.readFileSync(config.tls.key)
}

var url = 'mongodb://localhost:27017/instances'

process.title = 'rest_for_head'
process.env.DEBUG = config.debug || '*LOG* *WARN* *ERROR*'
mongoose.Promise = global.Promise
mongoose.connect(url)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
// TODO to serve the streams to the different users.
// won't be used when the ngix server is being not used.
app.use(bodyParser.json())
app.use(cors())
app.use('/stream', express.static(path.join(__dirname, '/stream')))
app.use(instanceRouter)
app.use(configurationRouter)

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    console.log("get's to error")
    console.log(err)
    // TODO is this enough. This isn't working.
  })
}

app.use(function (err, req, res, next) {
  console.log('production ' + err.message)
})
// Socket declaration
app.set('appName', 'rest_for_head')
app.set('port', process.env.PORT || 3011)

// server.listen(app.get('port'), function () {
let server = https.createServer(tls, (req, res) => {
  res.writeHead(404, 'Not Here')
  res.end()
})
server.listen(config.protoo.listenPort, config.protoo.listenIp, function () {
  console.log('Express server is listening on port ' + config.protoo.listenPort)
})
let webSocketServer = new protooServer.WebSocketServer(server, {
  maxReceivedFrameSize: 960000,
  maxReceivedMessageSize: 960000,
  fragmentOutgoingMessage: true,
  fragmentationThreshold: 960000
})

webSocketServer.on('connectionrequest', (info, accept, reject) => {
  let u = url_.parse(info.request.url, true)
  let roomId = u.query['room-id']
  let peerId = u.query['peer-id']

  if (!roomId || !peerId) {
    reject(400, 'Connection request without roomId and/or peerId')
    return
  }

  if (!rooms.has(roomId)) {
    let room = new Room(roomId, mediaServer)
    let logStatusTimer = setInterval(() => {
      room.logStatus()
    }, 10000)

    rooms.set(roomId, room)

    room.on('close', () => {
      rooms.delete(roomId)
      clearInterval(logStatusTimer)
    })
  }

  let room = rooms.get(roomId)
  let transport = accept()

  room.createProtooPeer(peerId, transport)
    .catch((error) => {
      console.log('error creating a protoo peer: %s', error)
    })
})
