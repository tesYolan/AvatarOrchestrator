var express = require('express');
var mongoose = require('mongoose'); 
var Instances = require('../models/instances'); 
var bodyParser = require('body-parser'); 
var instanceRouter = express.Router(); 

instanceRouter.route('/instances')
.get(function(req, res, next) {
	Instances.find({}, function (err, instances) {
		if (err) throw err; 
		res.json(instances); 
	}); 
}) 

.post(function(req, res, next){
	var netInstance = new Instances({
		name: req.body.name, 
		docker_id: req.body.docker_id, 
		token_id: req.body.token_id, 
		in_session: req.body.in_session
	}); 
	console.log(netInstance); 
	netInstance.save(function(err, instance) {
		console.log(req.body)
		if (err) throw err; 
		console.log('Instance Created'); 

		var id = instance._id; 
		res.writeHead(200, {'Content-Type': 'text/plain'}); 

		//TODO create docker instance here
		res.end('Created Instance' + id); 
	}) 
})
.delete(function(req,res,next){
	Instances.remove({}, function (err, resp) {
		if (err) throw err; 
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

		res.json(resp); 
	})
}); 
module.exports = instanceRouter; 
