var express = require('express')
var instanceRouter = express.Router()
var InstanceManager = require('../models/instance_manager')
// TODO validation for each of this commands before sending it to the function.
var { check, validationResult } = require('express-validator/check')
instanceRouter.route('/instances')
  .get(InstanceManager.getInstances)
  .post([
    check('instance_name').exists().withMessage('Name must specified').matches('(?:[a-z0-9_]+|[a-z0-9_][a-z0-9-_]+[a-z0-9_])'),
    check('vision_tool').exists().withMessage('Vision tool must be specified'),
    check('chatbot').exists().withMessage('Specifiy chatbot')
  ], InstanceManager.createInstance)
  .delete(InstanceManager.deleteAllInstances)
//  TODO how is the logic for starting to work? Some may be open, some may be closed. So let's skip this.
//  .put([
//    check('started').exists()
//  ], InstanceManager.updateInstances)
instanceRouter.route('/instances/:instanceId')
  .get(InstanceManager.getInstanceDetail)
  .put([
    // TODO isn't there a better way.
    check('started').exists().withMessage('must set start status')
  ], InstanceManager.updateInstance)
  .delete(InstanceManager.deleteSpecificInstance)
// TODO this don't have functionality.
// instanceRouter.route('/instances/:instanceId/increment')
//  .put(InstanceManager.incrementInstance)
// instanceRouter.route('/instances/:instanceId/decrement')
//  .put(InstanceManager.decrementInstance)
module.exports = instanceRouter
