var express = require('express');
var mongoose = require('mongoose'); 
var Instances = require('../models/instances'); 
var bodyParser = require('body-parser'); 
var instanceRouter = express.Router(); 
var Docker = require('dockerode'); 
var docker = new Docker(); 

var zerorpc = require('zerorpc'); 
var client = new zerorpc.Client(); 
client.connect('tcp://127.0.0.1:3111'); 

	instanceRouter.route('/instances')
	.get(function(req, res, next) {
		Instances.find({}, function (err, instances) {
			if (err) throw err; 
			console.log(instances.length); 
			res.json(instances); 
		}); 
	}) 

	.post(function(req, res, next){
		//TODO creating port bindings in instance to instance basis and storing this in the db. 
		client.invoke("create_display",req.body.instance_name, function(error, display, more) {
			if(error) console.log(error); 
			console.log(display); 
			docker.createContainer({
				Image: 'hanson:work', 
				AttachStdin: false, 
				AttachStdout: true, 
				AttachStderr: true, 
				Entrypoint: [""],
				Env: ["DISPLAY=:"+String(display),"QT_X11_NO_MITSHM=1"],
				ExposedPorts: { "4000":{}, "8000":{}, "10001":{},"9090":{} },
				Volumes: { "/tmp/.X11-unix": {},"/home/tyohannes/cloned_dire/private_ws/scripts/robot.sh":{} },
				HostConfig: { 
					//TODO this must also get into the dataset. 
					"PortBindings": {
						"4000" : [{ "HostPort":"4000"}], 
						"8000" : [{ "HostPort":"8000"}], 
						"10001" : [{ "HostPort": "10001"}],
						"9090" : [{ "HostPort": "9090"}]
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
			},(function(err, container) {
				if(err)
				{
					//TODO throw an error here. 
					console.log(err); 
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
			}))
		}); 
	})
	.delete(function(req,res,next){
		console.log('Deleting All Instances'); 

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
							if (err) console.log( err ) ; 
							console.log('deleted ' + name); 
							Instances.remove(name, function(err, resp) {
								client.invoke("stop_display",name, function(error, display, more) {
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

	}) 
	.put(function(req,res, next) {
		//TODO use this to stop all instances. 
		Instances.find({}, function (err, instances) {
			for (i = 0; i < instances.length; i++)
			{
				(function() {
					var name = instances[i].name; 
					var length = instances.length; 
					var j = i; 
					//TODO JUST STOP ALL CONTAINERS HERE> 
					Instances.findOneAndUpdate({"name":name}, {$set: req.body}, {new: true}, function (err, instance) {
						if (err) throw err; 
					}); 
				})(); 
			}
		}); 
		Instances.find({}, function (err, instances) { 
			if (err) throw err; 
			res.json(instances); 
		}); 
	}); 
	instanceRouter.route('/instances/:instanceId')

	.get(function(req, res, next) {
		Instances.findOne({ "name": req.params.instanceId}, function (err, instance) {
			if (err) throw err; 
			res.json(instance); 
		}); 
	})
	.put(function(req, res, next) {
		//TODO use this to stop or start specific instance. 
		Instances.findOneAndUpdate({ "name":req.params.instanceId},
			{$set: req.body}, { new: true }, function (err, instance) {
				if (err) throw err; 
				//res.json(instance); 
				var container = docker.getContainer(req.params.instanceId);
				//TODO change this to start script or stop. 
				if (req.body.started === 'false')
				{
					container.stop(function(err, data){
						//TODO stop container does it's job here. 
						if (err) console.log(err); 
						res.json(instance); 
					}); 
				}
				else
				{
					container.start(function(err, data)
					{
						//TODO start container does it's job here. 
						if (err) console.log(err); 
						res.json(instance); 
					}); 
				}
				//TODO How can i check if certain script is up in docker? How do I stop it? 
				//As it stands now, the docker container is just Created/ not started. 
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
					client.invoke("stop_display",req.params.instanceId, function(error, display, more) {
						console.log("Stopped Display"); 
					});
					console.log(data); 
					res.json(resp); 
				}); 
			}); 
		}); 
	}); 
	module.exports = instanceRouter; 
