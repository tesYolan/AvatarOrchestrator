var express = require('express');
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser'); 
var instanceRouter = express.Router(); 
var InstanceManager = require('../models/instance_manager'); 


instanceRouter.route('/instances')
.get(InstanceManager.getInstances) 
.post(InstanceManager.createInstance)
.delete(InstanceManager.deleteAllInstances) 
.put(InstanceManager.updateInstances); 
instanceRouter.route('/instances/:instanceId')
.get(InstanceManager.getInstanceDetail)
.put(InstanceManager.updateInstance)
.delete(InstanceManager.deleteSpecificInstance); 
instanceRouter.route('/instances/:instanceId/increment')
.put(InstanceManager.incrementInstance); 
instanceRouter.route('/instances/:instanceId/decrement')
.put(InstanceManager.decrementInstance)
module.exports = instanceRouter; 
