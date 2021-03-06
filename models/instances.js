var mongoose = require('mongoose')
var instanceConfiguration = mongoose.Schema({
  vision_stack: {type: String},
  chat_stack: {type: String}
})
var instanceSetting = mongoose.Schema({
  port_secure: {type: Number, required: true},
  port: {type: Number, required: true},
  port_web_socket: {type: Number, required: true}, // TODO how can we actually allow the websocet to be changed in the system.
  dummy: {type: Number, required: true}, // TODO how can we actually allow the websocet to be changed in the system.
  display: {type: String, required: true},
  RPC: {type: Number, required: true}
})
var instanceSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  docker_id: { type: String, required: true, unique: true },
  token_id: { type: String, required: true },
  in_session: { type: Number, required: true },
  started: { type: Boolean, required: true },
  instance_config: [ instanceConfiguration ],
  instance_values: [ instanceSetting ]
},
{ timestamps: true }
)

var Instances = mongoose.model('Instance', instanceSchema)

module.exports = Instances
