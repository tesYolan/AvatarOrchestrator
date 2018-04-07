var logger = require('./models/Logger')
var Server = require('./models/Server')
var connection = require('./models/mongoose_manager.js')
process.title = 'rest_for_head'
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
