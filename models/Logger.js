var winston = require('winston')
var Logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({level: 'debug'})
    // new (winston.transports.File)({ filename: 'somefile.log', level: 'error' })
  ]
})
module.exports = Logger
