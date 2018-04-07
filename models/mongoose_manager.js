var mongoose = require('mongoose')
var config = require('../config/config')
var logger = require('../models/Logger')
mongoose.Promise = global.Promise

// var url = 'mongodb://' + config.mongo.listenIp + ':' + config.mongo.listenPort // + '/instances'
var url = 'mongodb://mongodb:' + config.mongo.listenPort + '/instances'
logger.info(url)

var db = mongoose.connection

db.on('error', logger.error.bind(console, 'connection error:'))
db.on('open', () => {
  logger.info('Connected to DB')
})

module.exports.connection = mongoose.connect(url, { useMongoClient: true })
