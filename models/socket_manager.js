module.exports = {
  start: function (io) {
    io.on('connection', function (socket) {
      socket.on('message', function (message) {
        console.log('got message')
      })
      socket.on('message_to_sophia', function (message) {
        console.log('got message to sophia')
      })
      socket.on('disconnect', function () {
        console.log('disconnect event')
      })
    })
  }
}
