var express = require('express');
var mongoose = require('mongoose'); 
var Docker = require('dockerode'); 
var Instances = require('./instances'); 
var DisplayManager = require('./display_manager')

var docker = new Docker(); 
//TODO to display_manager
//TODO to database interaction
//TODO session manager

module.exports.createInstance = function createInstance(req, res, next){
	//TODO creating port bindings in instance to instance basis and storing this in the db. 
	DisplayManager.create_display(req.body.instance_name,4, function createNewInstance(error, display, more) {
		if(error) return next(String(error)); 
		console.log(display[0]); 
		docker.createContainer({
			Image: 'hanson:work', 
			AttachStdin: false, 
			AttachStdout: true, 
			AttachStderr: true, 
			Entrypoint: [""],
			Env: ["DISPLAY=:"+String(display[0]),"QT_X11_NO_MITSHM=1"],
			ExposedPorts: { "4000":{}, "8000":{}, "10001":{},"9090":{} },
			Volumes: { "/tmp/.X11-unix": {},"/home/tyohannes/cloned_dire/private_ws/scripts/robot.sh":{} },
			HostConfig: { 
				//TODO how do we check that the host port values are unique on the host. 
				"PortBindings": {
					"4000" : [{ "HostPort":String(display[1][0])}], 
					"8000" : [{ "HostPort":String(display[1][1])}], 
					"10001" : [{ "HostPort": String(display[1][2])}],
					//TODO it must be unique port setting otherwise it would crash
					//but this needs to be passed container configuration. 
					"9090" : [{ "HostPort": String(display[1][3])}]
				},
				"Binds": [ "/tmp/.X11-unix:/tmp/.X11-unix:rw","/home/tyohannes/cloned_dire/private_ws/scripts/robot.sh:/home/hanson_dev/hansonrobotics/private_ws/scripts/robot.sh" ],
				"Privileged": true,
				//			"Devices": ["/dev/snd","/dev/snd"]
			},
			Tty: true, 
			Cmd: ["/bin/bash","-c","hr run sophia_body"],
			OpenStdin: false,
			StdinOnce: false,
			name: req.body.instance_name
		},(function createInstanceforDB(err, container) {
			if(err)
			{
				//TODO throw an error here. 
				return next(err); 
			}
			console.log(container)
			var netInstance = new Instances({
				name: req.body.instance_name, 
				docker_id: container.id, //TODO must use the configuration that is set on the system. 
				token_id: req.body.instance_name + "_" +container.id, //TODO create a unique parameter for this. 
				in_session: 0, //TODO increase when the user is actually accessing the system. 
				started: true,
				config: [
					{
					//TODO add additional schema here. 
						vision_stack: req.body.vision_tool,
						chat_stack: req.body.chatbot
					}
				]

			}); 
			if(err) 
			{
			return next(err); 
			}
			else {
				console.log('there is no error'); 
				container.start(function saveToDB(err,data)
				{
					if(err) return next(err); 
					console.log('created containter first'); 
					netInstance.save(function(err, instance) {
						if (err) 
						{
							return next(err); 
						}

						var id = instance._id; 
						res.writeHead(200, {'Content-Type': 'text/plain'}); 

						//TODO create docker instance here
						res.end('Created Instance ' + id); 
					}) 
				})
			}
		}))
	}); 
}

module.exports.deleteAllInstances = function deleteAllInstances(req,res,next){
	console.log('Deleting All Instances'); 

	Instances.find({}, function deleteInstances(err, instances) {
		for (i = 0; i < instances.length; i++)
		{
			(function stopInstance() {
				var name = instances[i].name; 
				var length = instances.length; 
				var j = i; 
				console.log('name to stop and delete ' + name); 
				//TODO THE LOG FILES DON'T Accurately reflect the value of the system. 
				var container = docker.getContainer(instances[i].name); 
				container.stop(function deleteInstance(err, data){
					if (err) return next(err); 
					console.log('stopped ' + name); 

					container.remove(function removedInstance(err, data) {
						//TODO If the in_session users isn't zero, some kinda of warning would be necessary. 
						var counter = instances.length; 
						if (err) return next( err ) ; 
						console.log('deleted ' + name); 
						Instances.remove(name, function removeInstanceFromDB(err, resp) {
						if(err) return next(err); 
							DisplayManager.stop_display(name, function removedDisplay(error, display, more) {
								if(err) return next(error); 
								console.log("Stopped Display"); 
							});

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

}

module.exports.incrementInstance = function incrementInstance(req, res, next) {
	//TODO increment instance parameters. 
	//First Get the values
	Instances.findOneAndUpdate({ "name":req.params.instanceId},
		{$set: req.body}, { new: true }, function (err, instance) {
			if (err) return next(err); 
		}); 
}

module.exports.decrementInstance = function decrementInstance(req, res, next) {
	//TODO decrement instance in session system. 
	Instances.findOneAndUpdate({ "name":req.params.instanceId},
		{$set: req.body}, { new: true }, function (err, instance) {
			if (err) return next(err); 
		}); 
}


module.exports.deleteSpecificInstance = function deleteSpecificInstance(req, res, next) {
	console.log('Deleteing specific instance ' + String(req.params.instanceId)); 
	Instances.findOne({'name':req.params.instanceId}, function deleteInstance(err, resp) {
		if (err) return next(err); 

		var container = docker.getContainer(req.params.instanceId); 
		container.stop(function(err, data){
			if (err) return next(err); 
			container.remove(function (err, data) {
				//TODO If the in_session users isn't zero, some kinda of warning would be necessary. 
				//TODO another one; stop container needs be able to generate video streams. 
				if (err) return next(err); 
				client.invoke("stop_display",req.params.instanceId, function(error, display, more) {
					if(error) return next(err); 
					console.log("Stopped Display"); 
				});
				res.json(resp); 
			}); 
		}); 
	}); 
}

module.exports.updateInstance = function updateInstance(req, res, next) {
	//TODO use this to stop or start specific instance. 
	Instances.findOneAndUpdate({ "name":req.params.instanceId},
		{$set: req.body}, { new: true }, function startorstopInstance(err, instance) {
			if (err) return next(err); 
			//res.json(instance); 
			var container = docker.getContainer(req.params.instanceId);
			//TODO change this to start script or stop. 
			if (req.body.started === 'false')
			{
				container.stop(function(err, data){
					console.log("Stopping Container " + String(req.params.instanceId)); 
					//TODO stop container does it's job here. 
					if (err) return next(err); 
					res.json(instance); 
				}); 
			}
			else
			{
				container.start(function(err, data)
				{
					console.log("Starting Container " + String(req.params.instanceId)); 
					//TODO start container does it's job here. 
					if (err) return next(err); 
					res.json(instance); 
				}); 
			}
			//TODO How can i check if certain script is up in docker? How do I stop it? 
			//As it stands now, the docker container is just Created/ not started. 
		}); 
}

module.exports.getInstanceDetail = function getInstanceDetail(req, res, next) {
	Instances.findOne({ "name": req.params.instanceId}, function (err, instance) {
		if (err) return next(err); 
		res.json(instance); 
	}); 
}

module.exports.updateInstances = function updateInstances(req,res, next) {
	//TODO use this to stop all instances. 
	Instances.find({}, function updateInstance(err, instances) {
		for (i = 0; i < instances.length; i++)
		{
			(function() {
				var name = instances[i].name; 
				var length = instances.length; 
				var j = i; 
				//TODO JUST STOP ALL CONTAINERS HERE> 
				Instances.findOneAndUpdate({"name":name}, {$set: req.body}, {new: true}, function (err, instance) {
					if (err) return next(err); 
				}); 
			})(); 
		}
	}); 
	Instances.find({}, function (err, instances) { 
		if (err) return next(err); 
		res.json(instances); 
	}); 
}

module.exports.getInstances = function getInstances(req, res, next) {
	Instances.find({}, function (err, instances) {
		if (err) return next(err); 
		console.log(instances.length); 
		res.json(instances); 
	}); 
}
