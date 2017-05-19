var express = require('express'); 
var mongoose = require('mongoose'); 
var GeneralConfiguration = require('../models/generalconfiguration'); 

var bodyParser = require('body-parser'); 
var configurationRouter = express.Router(); 

configurationRouter.route('/configuration')
.get(function(res, req, next) {
	GeneralConfiguration.find({}, function(err, configs) {
		if (err) throw err; 
		//TODO i am assuming that i am just using one config.
		console.log("Getting Request"); 
		req.json(configs);
	})
})

.post(function(req, res, next) {
	console.log(req.body); 
	var config = new GeneralConfiguration({
		docker_image: req.body.name.docker_image, 
		commit_id: req.body.name.commit_id, 
		max_session_number: req.body.name.max_session_number
	}); 
	console.log('Overwritten Configuration');
	//TODO delete all previous elements. 
	GeneralConfiguration.remove({}, function (err, resp) {
		if (err) throw err; 
	})
	config.save(function(err, configuration) {
		if (err) throw err; 
		var id = configuration._id; 
		res.writeHead(200, {'Content-Type': 'text/plain'}); 

		res.end('Overwritten Configuration' + id); 
	})
}); 
module.exports = configurationRouter; 
