var mongoose = require('mongoose')
var config = require('./config/config')
var logger = require('./models/Logger')
var url = 'mongodb://' + config.mongo.listenIp + ':' + config.mongo.listenPort + '/instances'
var Server = require('./models/Server')
process.title = 'rest_for_head'
mongoose.Promise = global.Promise
mongoose.connect(url, { useMongoClient: true })
var db = mongoose.connection
db.on('error', logger.error.bind(console, 'connection error:'))
const server = new Server()
server.listen({})
server.on('new-connection', (connection) => {
  logger.info('*******************gets new connection')
  connection.on('new-stream', (stream) => {
    logger.info('*********reaches here also')
  })
    .on('close', (peerId) => {
      logger.info('*************close works')
    })
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
