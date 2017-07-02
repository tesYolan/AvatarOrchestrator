var mongoose = require('mongoose')

var generalConfigurationSchema = mongoose.Schema({
  docker_image: { type: String, required: true },
  commit_id: { type: String, required: true},
  max_session_number: { type: String, required: true}
})

var GeneralConfiguration = mongoose.model('Configuration', generalConfigurationSchema)
// TODO make it singleton. Or make it configurable from Server configuration setup
module.exports = GeneralConfiguration
