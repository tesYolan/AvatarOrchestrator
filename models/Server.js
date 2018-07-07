var url_ = require('url')
var bodyParser = require('body-parser')
var https = require('https')
var http = require('http')
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
var logger = require('./Logger')

var validator = require('express-validator')

class Server extends EventEmitter {
  constructor () {
    super()
    this.rooms = new Map()
    // process.env.DEBUG = config.debug || '*LOG* *WARN* *DEBUG* *ERROR*'
  }

  setWebServer (webServer) {
    this.webServer = webServer
    return this
  }

  listen (options) {
    this.options = options
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

      room.on('newpeer', (peer) => {
        global.PEER = peer

        if (peer.consumers.length > 0) { global.CONSUMER = peer.consumers[peer.consumers.length - 1] }

        peer.on('newtransport', (transport) => {
          global.TRANSPORT = transport
        })

        peer.on('newproducer', (producer) => {
          global.PRODUCER = producer
        })

        peer.on('newconsumer', (consumer) => {
          global.CONSUMER = consumer
        })
      })
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
    app.use(validator())
    app.use(cors())
    // TODO refactor this to handle
    // app.use('/stream', express.static(path.join(__dirname, '/../stream')))
    app.use(instanceRouter)
    app.use(configurationRouter)

    if (app.get('env') === 'development') {
      app.use(function (err, req, res, next) {
        logger.error("get's to error")
        logger.error(err)
        res.status(400).send(err);
        // TODO is this enough. This isn't working.
        // Here should i list every possible variations of the error.
        // List all errors as indicators for the system.
      })
    }

    app.use(function (err, req, res, next) {
      res.send(err)
      logger.error('production ' + err.message)
    })
    app.set('appName', 'rest_for_head')

    // server.listen(app.get('port'), function ()
    this.server_ = http.createServer(app)
    this.server = https.createServer(this.tls, app => {
    })
    this.server.listen(config.protoo.listenPort, config.protoo.listenIp, function () {
      logger.info('Protoo server is listening on port ' + config.protoo.listenPort)
    })
    this.server_.listen(config.http.listenPort)
    logger.info('API listening http on port: ' + config.http.listenPort)
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
      let roomId = u.query['roomId']
      let peerName = u.query['peerName']

      logger.info(
        'connection request [roomId:"%s", peerName:"%s"]', roomId, peerName)
      let room
      if (!roomId || !peerName) {
        logger.warn('connection request without roomId and/or peerName')

        reject(400, 'Connection request without roomId and/or peerName')

        return
      }
      logger.info(
        'connection request [roomId:"%s", peerName:"%s"]', roomId, peerName)

      if (!this.rooms.has(roomId)) {
        logger.info('creating a new Room [roomId:"%s"]', roomId)

        try {
          room = new Room(roomId, this.mediaServer)

          global.APP_ROOM = room
        } catch (error) {
          logger.error('error creating a new Room: %s', error)

          reject(error)

          return
        }

        const logStatusTimer = setInterval(() => {
          room.logStatus()
        }, 30000)

        this.rooms.set(roomId, room)
        this.emit('new-connection', room)

        room.on('close', () => {
          this.rooms.delete(roomId)
          clearInterval(logStatusTimer)
        })
      } else {
        room = this.rooms.get(roomId)
      }

      let transport = accept()

      room.handleConnection(peerName, transport)
    })
    // TODO do functional parameters.
  }
}

module.exports = Server
