var mongoose = require("mongoose"); 
var instanceConfiguration = mongoose.Schema({
vision_stack: {type: String},
chat_stack: {type: String},
}); 
var instanceSchema = mongoose.Schema({
	name: { type: String, required: true, unique: true }, 
	docker_id: { type: String, required: true, unique: true }, 
	token_id: { type: String, required: true}, 
	in_session: { type: Number, required: true}, 
	config: [ instanceConfiguration ]
}, 
{ timestamps: true } 
); 

var Instances = mongoose.model("Instance", instanceSchema); 

module.exports = Instances; 
