var path = require('path')
var url_ = require('url')
var bodyParser = require('body-parser')
var https = require('https')
var cors = require('cors')
var instanceRouter = require('../routes/routesInstance')
var configurationRouter = require('../routes/routesConfiguration')

var config = require('../config/config')
var express = require('express')
var Room = require('./Room')
var protooServer = require('protoo-server')

var mediasoup = require('mediasoup')

var fs = require('fs')
var socketIO = require('socket.io')
var EventEmitter = require('events')

class Server extends EventEmitter {
  constructor () {
    super()
    this.rooms = new Map()
    process.env.DEBUG = config.debug || '*LOG* *WARN* *ERROR*'
  }

  setWebServer (webServer) {
    this.webServer = webServer
    return this
  }

  listen (options) {
    this.options = options
    this.mediaServer = mediasoup.Server(options)
    this.mediaServer = mediasoup.Server({
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
    global.SERVER = this.mediaServer
    this.mediaServer.on('newroom', (room) => {
      global.ROOM = room
    })

    if (!this.webServer) {
      this.startWebServer()
    }

    this.startSocketServer()

    setTimeout(() => {
      this.emit('listen')
    }, 0)

    return this
  }

  startWebServer () {
    const app = express()
    this.tls = {
      cert: fs.readFileSync(config.tls.cert),
      key: fs.readFileSync(config.tls.key)
    }
    app.use(bodyParser.json())
    app.use(cors())
    // TODO refactor this to handle
    app.use('/stream', express.static(path.join(__dirname, '/../stream')))
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

    // server.listen(app.get('port'), function () 
    this.server = https.createServer(this.tls, (req, res) => {
      res.writeHead(404, 'Not Here')
      res.end()
    })
    // TODO where should this funciton be.
    this.server.listen(config.protoo.listenPort, config.protoo.listenIp, function () {
      console.log('Express server is listening on port ' + config.protoo.listenPort)
    })
  }

  startSocketServer () {
    this.io = socketIO(this.webServer)

    let webSocketServer = new protooServer.WebSocketServer(this.server, {
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

      if (!this.rooms.has(roomId)) {
        let room = new Room(roomId, this.mediaServer)
        let logStatusTimer = setInterval(() => {
          room.logStatus()
        }, 10000)

        this.rooms.set(roomId, room)
        this.emit('new-connection', room)
        room.on('close', () => {
          this.rooms.delete(roomId)
          clearInterval(logStatusTimer)
        })
      }

      let room = this.rooms.get(roomId)
      let transport = accept()

      room.createProtooPeer(peerId, transport)
        .catch((error) => {
          console.log('error creating a protoo peer: %s', error)
        })
    })
    // TODO do functional parameters.
  }
}

module.exports = Server

// var io = socketIO(mediaServer)
// const RtspServer = require('mediasoup-server').RtspServer
// const rtspServer = new RtspServer(mediaServer)
// rtspServer
//  .listen(5000)
//  .on('listen', (port) => {
//    console.log(`RTSP server started rtsp://192.168.1.48:${port}`)
//  })
//  .on('new-source', (source) => {
//    let rtspUrl = `rtsp://192.168.1.48:${rtspServer.port}/${source.id}.sdp`
//    source.on('enabled', () => {
//      console.log(`RTSP source available: ${rtspUrl}`)
//    })
//  })
