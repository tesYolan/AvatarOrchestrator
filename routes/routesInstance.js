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
		console.log(instances.length); 
		res.json(instances); 
	}); 
}) 

.post(function(req, res, next){
	//TODO how can we create or spawn a docker instance in this place. 
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
	},(function(err, container) {
		if(err)
		{
			console.log(err); 
		}
		console.log(container)
		var netInstance = new Instances({
			name: req.body.instance_name, 
			docker_id: container.id, //TODO must use the configuration that is set on the system. 
			token_id: req.body.instance_name + "_" +container.id, //TODO create a unique parameter for this. 
			in_session: 0, //TODO increase when the user is actually accessing the system. 
			config: [
				{
					vision_stack: req.body.vision_tool,
					chat_stack: req.body.chatbot
				}
			]

		}); 
		if(err) 
		{
			console.log('there is an error'); 
			res.writeHead(409, {'Content-Type': 'application/json'}); 
			res.end(JSON.stringify({'err':'name-error'}));
		}
		else {
			console.log('there is no error'); 
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
		}
	})); 
})
.delete(function(req,res,next){
	console.log('Deleting All Instances'); 
	//TODO delete the docker instance here. 
	//Now the trick is delete all containers currently in the system. 
	//Or should we get the name of the system, cause host system may 
	//contain other things
	// So, we must get all the instnaces that we are getting. 

	//TODO now do this, get all the instances and then check if i can 
	//do delete all commands from this. 

	Instances.find({}, function (err, instances) {
		for (i = 0; i < instances.length; i++)
		{
			(function() {
			var name = instances[i].name; 
			var length = instances.length; 
			var j = i; 
			console.log('name to stop and delete ' + name); 
			//TODO THE LOG FILES DON'T Accurately reflect the value of the system. 
			var container = docker.getContainer(instances[i].name); 
			container.stop(function(err, data){
				if (err) console.log(err); 
				console.log('stopped ' + name); 

				container.remove(function (err, data) {
					//TODO If the in_session users isn't zero, some kinda of warning would be necessary. 
					var counter = instances.length; 
					if (err) throw err; 
					console.log('deleted ' + name); 
					Instances.remove(name, function(err, resp) {
						console.log('deleted from database ' + name); 
						console.log(j); 
						if(j === length-1)
						{
							res_ = [{'Deleted': 'Everything'}]; 
							res.json(res_); 
						}
					}); 
				}); 
			});
		})(); 
		}
	}); 

	//	Instances.remove({}, function (err, resp) {
		//		if (err) throw err; 
		//		console.log(resp); 
		//		res.json(resp); 
		//	}); 
}); 
instanceRouter.route('/instances/:instanceId')

.get(function(req, res, next) {
	Instances.findOne({ "name": req.params.instanceId}, function (err, instance) {
		if (err) throw err; 
		res.json(instance); 
	}); 
})
.delete(function(req, res, next) {
	console.log('Deleteing specific instance'); 
	Instances.remove(req.params.instanceId, function(err, resp) {
		if (err) throw err; 

		var container = docker.getContainer(req.params.instanceId); 
		container.stop(function(err, data){
			container.remove(function (err, data) {
				//TODO If the in_session users isn't zero, some kinda of warning would be necessary. 
				if (err) console.log(err); 
				console.log(data); 
				res.json(resp); 
			}); 
		}); 
	}); 
}); 
module.exports = instanceRouter; 
