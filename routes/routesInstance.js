var express = require('express');
var mongoose = require('mongoose'); 
var Instances = require('../models/instances'); 
var bodyParser = require('body-parser'); 
var instanceRouter = express.Router(); 
var Docker = require('dockerode'); 
var docker = new Docker(); 

instanceRouter.route('/instances')
.get(function(req, res, next) {
	Instances.find({}, function (err, instances) {
		if (err) throw err; 
		res.json(instances); 
	}); 
}) 

.post(function(req, res, next){
	//TODO how can we create or spawn a docker instance in this place. 
	var netInstance = new Instances({
		name: req.body.instance_name, 
		docker_id: "docker-id", //TODO must use the configuration that is set on the system. 
		token_id: "token-id", //TODO need to use the set configuration from the system. 
		in_session: 0, //
		config: [
			{
				vision_stack: req.body.vision_tool,
				chat_stack: req.body.chatbot
			}
		]

	}); 
	//TODO now we have created the instance configuration. Let's populated
	//it with values from the newInstance Instance variable. 
	docker.createContainer({
		Image: 'hanson_root:latest', 
		AttachStdin: false, 
		AttachStdout: true, 
		AttachStderr: true, 
		Tty: true, 
		Cmd: ['/bin/bash'],
		OpenStdin: false,
		StdinOnce: false,
		name: req.body.instance_name
	}).then(function(container) {
		container.start(function (err,data)
		{
			console.log('created containter first'); 
			netInstance.save(function(err, instance) {
				if (err) 
				{
					console.log(err); 
					//throw err; 
				}

				var id = instance._id; 
				res.writeHead(200, {'Content-Type': 'text/plain'}); 

				//TODO create docker instance here
				res.end('Created Instance ' + id); 
			}) 
		})
	}); 
})
.delete(function(req,res,next){
	//TODO delete the docker instance here. 
	//Now the trick is delete all containers currently in the system. 
	//Or should we get the name of the system, cause host system may 
	//contain other things
	// So, we must get all the instnaces that we are getting. 
	Instances.remove({}, function (err, resp) {
		if (err) throw err; 
		console.log(resp); 
		res.json(resp); 
	})
}); 
instanceRouter.route('/instances/:instanceId')

.get(function(req, res, next) {
	Instances.findOne({ "name": req.params.instanceId}, function (err, instance) {
		if (err) throw err; 
		res.json(instance); 
	}); 
})
.delete(function(req, res, next) {
	Instances.remove(req.params.instanceId, function(err, resp) {
		if (err) throw err; 

		var container = docker.getContainer(req.params.instanceId); 
		container.remove(function (err, data) {
			if (err) throw err; 
			console.log(data); 
			res.json(resp); 
		}); 
	})
}); 
module.exports = instanceRouter; 
