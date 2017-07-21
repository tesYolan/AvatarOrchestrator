var socket = require('socket.io')
var uuid = require('uuid')
var rooms = {}
var userIds = {}
module.exports.listen = function (app) {
  var io = socket.listen(app)

  var users = io.of('/users')
  users.on('connection', function (socket) {
    var currentRoom, id

    socket.on('init', function (data, fn) {
      currentRoom = (data || {}).room || uuid.v4()
      var room = rooms[currentRoom]
      if (!data) {
        rooms[currentRoom] = [socket]
        id = userIds[currentRoom] = 0
        fn(currentRoom, id)
        console.log('Room Created, with #', currentRoom)
      } else {
        if (!room) {
          return
        }
        userIds[currentRoom] += 1
        id = userIds[currentRoom]
        fn(currentRoom, id)
        room.forEach(function (s) {
          s.emit('peer.connected', { id: id })
        })
        room[id] = socket
        console.log('peer connected to room', currentRoom, 'with #', id)
      }
    })
    socket.on('msg', function (data) {
      var to = parseInt(data.to, 10)
      if (rooms[currentRoom] && rooms[currentRoom][to]) {
        console.log('redirecting ', to, 'by', data.by)
        rooms[currentRoom][to].emit('msg', data)
      } else {
        console.warn('Invalid user')
      }
    })

    socket.on('disconnect', function () {
      if (!currentRoom || !rooms[currentRoom]) {
        return
      }
      delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)]
      rooms[currentRoom].forEach(function (socket) {
        if (socket) {
          socket.emit('peer.disconnected', { id: id })
        }
      })
    })
  })

  return io
}
