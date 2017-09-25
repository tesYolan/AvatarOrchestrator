var Docker = require('dockerode')
var Instances = require('./instances')
var DisplayManager = require('./display_manager')
var config = require('../config/config')
var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
    // new (winston.transports.File)({ filename: 'log_.log' })
  ]
})
logger.level = 'debug' || 'info' || 'log'
var docker = new Docker()
// TODO session manager

/**
 * createInstance code to create instance. The creates creates and starts the instance. 
 *
 * @param req - expected format in the JSON "instance_name": "valid_docker_name", "vision_tool" : "cmt", "chatbot" : "opencog" . Besides giving the instance_name a vaild name for docker which is [ a-zA-Z0-9_ ]+, it is expected vision_tool values are pi_vision/cmt. chatbot valid values are opencog/AIML
 * @param res - Response is going to be for valid system. ('Created Instance ' + id)
 * For invalid system states, the response is yet to thought out. 
 * @param next - Invalid states go this response. 
 * @returns {undefined}
 */
module.exports.createInstance = function createInstance (req, res, next) {
  DisplayManager.createDisplay(req.body.instance_name, 4, function createNewInstance (error, display, more) {
    if (error) return next(String(error))
    logger.log(display[0])
    docker.createContainer({
      Image: config.docker_image,
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Entrypoint: [''],
      Env: ['DISPLAY=:' + String(display[0]), 'QT_X11_NO_MITSHM=1'],
      ExposedPorts: { '4000': {}, '8000': {}, '10001': {}, '9090': {} },
      Volumes: { '/tmp/.X11-unix': {}, '/home/tyohannes/cloned_dire/private_ws/scripts/robot.sh': {} },
      HostConfig: {
        'PortBindings': {
          '4000': [{ 'HostPort': String(display[1][0]) }],
          '8000': [{ 'HostPort': String(display[1][1]) }],
          '10001': [{ 'HostPort': String(display[1][2]) }],
          '9090': [{ 'HostPort': String(display[1][3]) }]
        },
        // TODO Refactor this out. 
        'Binds': [ '/tmp/.X11-unix:/tmp/.X11-unix:rw', '/home/tyohannes/cloned_dire/private_ws/scripts/robot.sh:/home/hanson_dev/hansonrobotics/private_ws/scripts/robot.sh' ],
        'Privileged': true
        // "Devices": ["/dev/snd","/dev/snd"]
      },
      Tty: true,
      Cmd: ['/bin/bash', '-c', 'hr run sophia_body'],
      OpenStdin: false,
      StdinOnce: false,
      name: req.body.instance_name
    }, function createInstanceforDB (err, container) {
      if (err) {
        logger.error('error creating container')
        return next(err)
      }

      logger.log(container)
      var netInstance = new Instances({
        name: req.body.instance_name,
        docker_id: container.id, // TODO must use the configuration that is set on the system.
        token_id: req.body.instance_name + '_' + container.id, // TODO create a unique parameter for this.
        in_session: 0, // TODO increase when the user is actually accessing the system.
        started: true,
        config: [
          {
            vision_stack: req.body.vision_tool,
            chat_stack: req.body.chatbot
          }
        ]

      })
      if (err) {
        logger.error('error creating container - 1')
        return next(err)
      } else {
        logger.info('there is no error')
        container.start(function saveToDB (err, data) {
          if (err) {
            logger.error('starting the container failed')
            return next(err)
          }
          logger.log('created containter first')
          netInstance.save(function (err, instance) {
            if (err) {
              return next(err)
            }

            var id = instance._id
            res.writeHead(200, {'Content-Type': 'text/plain'})

            res.end('Created Instance ' + id)
          })
        })
      }
    })
  })
}

/**
 * deleteAllInstances
 *
 * @param req - not used. 
 * @param res - gives out the deleted system.
 * @param next - error is redirected here. 
 * @returns {undefined}
 */
module.exports.deleteAllInstances = function deleteAllInstances (req, res, next) {
  logger.log('Deleting All Instances')

  Instances.find({}, function deleteInstances (err, instances) {
    if (err) {
      logger.info('error in deleteInstances')
      return next(err)
    }
    for (var i = 0; i < instances.length; i++) {
      (function stopInstance () {
        var name = instances[i].name
        var length = instances.length
        var j = i
        logger.log('name to stop and delete ' + name)
        var container = docker.getContainer(instances[i].name)
        container.stop(function deleteInstance (err, data) {
          if (err) logger.log('Container is stopped, Proceeding to delete') // return next(err)
          logger.log('stopped ' + name)

          container.remove(function removedInstance (err, data) {
            if (err) {
              logger.info('error in removedInstance')
              return next(err)
            }
            logger.log('deleted ' + name)
            Instances.remove(name, function removeInstanceFromDB (err, resp) {
              if (err) {
                logger.info('error in removeInstanceFromDB')
                return next(err)
              }
              DisplayManager.stopDisplay(name, function removedDisplay (error, display, more) {
                if (error) {
                  logger.info('error in removedDisplay')
                  return next(err)
                }
                logger.log('Stopped Display')
              })

              logger.log('deleted from database ' + name)
              logger.log(j)
              if (j === length - 1) {
                var res_ = [{'Deleted': 'Everything'}]
                res.json(res_)
              }
            })
          })
        })
      })()
    }
  })
}

/**
 * incrementInstance - not used. 
 * @deprecated Using mediasoup
 * @param req
 * @param res
 * @param next
 * @returns {undefined}
 */
module.exports.incrementInstance = function incrementInstance (req, res, next) {
  Instances.findOneAndUpdate({ 'name': req.params.instanceId },
    {$set: req.body}, { new: true }, function (err, instance) {
      if (err) {
        logger.info('error in getInstanceDetail')
        return next(err)
      }
    })
}

/**
 * decrementInstance
 * @deprecated Using mediasoup. Delete the next system. 
 * @param req
 * @param res
 * @param next
 * @returns {undefined}
 */
module.exports.decrementInstance = function decrementInstance (req, res, next) {
  Instances.findOneAndUpdate({ 'name': req.params.instanceId },
    {$set: req.body}, { new: true }, function (err, instance) {
      if (err) {
        logger.info('error in getInstanceDetail')
        return next(err)
      }
    })
}

/**
 * deleteSpecificInstance
 *
 * @param req - req.params.instanceId represents the instance to delete. 
 * @param res - the Mongo delete response. 
 * @param next - Error holder
 * @returns {undefined}
 */
module.exports.deleteSpecificInstance = function deleteSpecificInstance (req, res, next) {
  logger.log('Deleteing specific instance ' + String(req.params.instanceId))
  Instances.findOne({'name': req.params.instanceId}, function deleteInstance (err, response) {
    if (err) return next(err)

    var container = docker.getContainer(req.params.instanceId)
    container.stop(function (err, data) {
      if (err) logger.log('Container is stopped already, Proceeding to next') // return next(err)
      container.remove(function (err, data) {
        if (err) return next(err)
        DisplayManager.stopDisplay(req.params.instanceId, function (error, display, more) {
          if (error) return next(err)
          logger.log('Stopped Display')
          Instances.remove({'name': req.params.instanceId}, function (err, resp) {
            if (err) {
              logger.info('error in getInstanceDetail')
              return next(err)
            }
            res.json(resp)
          })
        })
      })
    })
  })
}

/**
 * updateInstance 
 * Indicator for whether the instance is started or stopped. It toggles the state.
 *
 * @param req - req.params.instanceId holds instance to stopped. 
 * @param res - return the instance that has been stopped/started.
 * @param next - Error
 * @returns {undefined}
 */
module.exports.updateInstance = function updateInstance (req, res, next) {
  Instances.findOneAndUpdate({'name': req.params.instanceId},
    {$set: req.body}, { new: true }, function startorstopInstance (err, instance) {
      if (err) return next(err)
      var container = docker.getContainer(req.params.instanceId)
      if (req.body.started === 'false') {
        container.stop(function (err, data) {
          logger.log('Stopping Container ' + String(req.params.instanceId))
          if (err) logger.log('container is stopped already, Proceeding to next') // return next(err)
          res.json(instance)
        })
      } else {
        container.start(function (err, data) {
          logger.log('Starting Container ' + String(req.params.instanceId))
          if (err) {
            logger.info('error in getInstanceDetail')
            return next(err)
          }
          res.json(instance)
        })
      }
    })
}

/**
 * getInstanceDetail
 *
 * @param req - req.params.instanceId the instance to get the detail. 
 * @param res - response is the instance stored in mongodb. 
 * @param next - Error if the instance not found in db.
 * @returns {undefined}
 */
module.exports.getInstanceDetail = function getInstanceDetail (req, res, next) {
  Instances.findOne({ 'name': req.params.instanceId }, function (err, instance) {
    if (err) {
      logger.info('error in getInstanceDetail')
      return next(err)
    }
    res.json(instance)
  })
}

/**
 * updateInstances - Same as updateInstance but for all the instances. 
 *
 * @param req - not used
 * @param res - All the instances. 
 * @param next - Error
 * @returns {undefined}
 */
module.exports.updateInstances = function updateInstances (req, res, next) {
  Instances.find({}, function updateInstance (err, instances) {
    if (err) return next(err)
    for (var i = 0; i < instances.length; i++) {
      (function () {
        var name = instances[i].name
        Instances.findOneAndUpdate({'name': name}, {$set: req.body}, {new: true}, function (err, instance) {
          if (err) return next(err)
        })
      })()
    }
  })
  Instances.find({}, function (err, instances) {
    if (err) {
      logger.info('error in update')
      return next(err)
    }
    res.json(instances)
  })
}

/**
 * getInstances
 *
 * @param req - not used
 * @param res - all the instances in db. Note this may not be consistent with the docker
 * @param next - error if there is mistake in the db. 
 * @returns {undefined}
 */
module.exports.getInstances = function getInstances (req, res, next) {
  Instances.find({}, function (err, instances) {
    if (err) return next(err)
    logger.log(instances.length)
    res.json(instances)
  })
}
