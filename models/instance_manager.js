var Docker = require('dockerode')
var Instances = require('./instances')
var DisplayManager = require('./display_manager')
var RPCManager = require('./rpc_manager')
var config = require('../config/config')
var winston = require('winston')
var { check, validationResult } = require('express-validator/check')
var { matched, sanitize } = require('express-validator/filter')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
    // new (winston.transports.File)({ filename: 'log_.log' })
  ]
})
logger.level = 'debug' || 'info' || 'log'
var docker = new Docker()

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
  // TODO here validate the request that I am sending back. 
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.mapped()})
  }
  DisplayManager.createDisplay(req.body.instance_name, 6, function createNewInstance (error, display, more) {
    if (error) return next(String(error))
    logger.info(display[0])
    docker.createContainer({
      Image: config.docker_image,
      // AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Entrypoint: ['/bin/sh', '-c', 'python /home/hanson_dev/hansonrobotics/hr_launchpad/misc.py'],
      Env: ['DISPLAY=:' + String(display[0]), 'QT_X11_NO_MITSHM=1', 'VGL_DISPLAY=:' + String(display[0])],
      ExposedPorts: { '4000': {}, '8000': {}, '10001': {}, '9090': {}, '4242': {}, '5999': {} },
      Volumes: { '/tmp/.X11-unix': {} },
      HostConfig: {
        'PortBindings': {
          '4000': [{ 'HostPort': String(display[1][0]) }], // FOR HTTPS request
          '8000': [{ 'HostPort': String(display[1][1]) }], // FOR HTTP request
          '10001': [{ 'HostPort': String(display[1][2]) }], // FOR WHAT?
          '9090': [{ 'HostPort': String(display[1][3]) }], // FOR WEBSOCKET ROS -> IS THIS NEEDED
          '4242': [{ 'HostPort': String(display[1][4]) }], // FOR RPC commands in the containers
          '5999': [{ 'HostPort': String(display[1][5]) }] // FOR RTSP 
        },
        'Binds': [ '/tmp/.X11-unix:/tmp/.X11-unix:rw' ],
        'Privileged': true
        // "Devices": ["/dev/snd","/dev/snd"]
      },
      Tty: true,
      // TODO don't run system command this creates delete command for container and stop the system. 
      // Cmd: ['/bin/bash', '-c', 'hr run sophia_body'],
      Cmd: ['/bin/bash'],
      OpenStdin: false,
      StdinOnce: false,
      name: req.body.instance_name
    }, function createInstanceforDB (err, container) {
      if (err) {
        logger.error('error creating container')
        return next(err)
      }

      logger.info(display)
      var netInstance = new Instances({
        name: req.body.instance_name,
        docker_id: container.id, // TODO must use the configuration that is set on the system.
        token_id: req.body.instance_name + '_' + container.id, // TODO create a unique parameter for this.
        in_session: 0, // TODO increase when the user is actually accessing the system.
        started: false,
        instance_config: [{
          vision_stack: req.body.vision_tool,
          chat_stack: req.body.chatbot
        }],
        instance_values: [{
          port_secure: display[1][0],
          port: display[1][1],
          port_web_socket: display[1][2],
          dummy: display[1][3],
          display: display[0],
          RPC: display[1][4],
          RTSP: display[1][5]
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
          netInstance.save(function (err, instance) {
            if (err) {
              logger.error('error creating container')
              return next(err)
            }
            logger.info('created containter first')

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
  logger.info('Deleting All Instances')

  Instances.find({}, function deleteInstances (err, instances) {
    if (err) {
      logger.error('error in deleteInstances')
      return next(err)
    }
    // TODO REDO THIS FOLLOWING.
    if (instances.length === 0) { res.json(instances) }
    for (var i = 0; i < instances.length; i++) {
      (function stopInstance () {
        var name = instances[i].name
        var length = instances.length
        var j = i
        logger.info('name to stop and delete ' + name)
        var container = docker.getContainer(instances[i].name)
        container.stop(function deleteInstance (err, data) {
          if (err) logger.warn('Container is stopped, Proceeding to delete') // return next(err)
          logger.info('stopped ' + name)

          container.remove(function removedInstance (err, data) {
            if (err) {
              logger.error(err)
              logger.warn('Couldnt remove container, Proceeding to next element, Run Sanity Check')
            }
            logger.info('deleted ' + name)
            Instances.findOneAndRemove({'name': name}, function removeInstanceFromDB (err, resp) {
              if (err) {
                logger.error('error in removeInstanceFromDB')
                return next(err)
              }
              logger.info('Deleted element from DB %s', resp)
              DisplayManager.stopDisplay(name, function removedDisplay (error, display, more) {
                if (error) {
                  logger.error('stopped display returned with %s', error)
                  logger.warn('External Module may not be in best shape; Run Sanity Check')
                }
                logger.info('Stopped Display')
              })

              logger.info('deleted from database ' + name)
              logger.info(j)
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
 * incrementInstance - not used. Removed in a next major refactoring.
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
        logger.error('error in getInstanceDetail')
        return next(err)
      }
    })
}

/**
 * decrementInstance - not used. Removed in next major refactoring.
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
        logger.error('error in getInstanceDetail')
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
  logger.info('Deleteing specific instance ' + String(req.params.instanceId))
  Instances.findOne({'name': req.params.instanceId}, function deleteInstance (err, response) {
    if (err) {
      logger.error(err)
      return next(err)
    }

    var container = docker.getContainer(req.params.instanceId)
    container.stop(function (err, data) {
      if (err) {
        logger.error('Container is stopped already, Proceeding to next') // return next(err)
      }
      container.remove(function (err, data) {
        if (err) {
          logger.error(err)
          return next(err)
        }
        DisplayManager.stopDisplay(req.params.instanceId, function (error, display, more) {
          if (error) {
            logger.error('stopped display returned with %s', error)
            logger.warn('External Module may not be in best shape; Run Sanity Check')
          }
          logger.info('Stopped Display')
          Instances.findOneAndRemove({'name': req.params.instanceId}, function (err, resp) {
            if (err) {
              logger.error('error in getInstanceDetail')
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
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() })
  }
  Instances.findOne({ 'name': req.params.instanceId }, function (err, instance) {
    if (err) {
      logger.error("Couldn't find entry")
      return next(err)
    }
    logger.info('Request is looking for %s', req.params.instanceId)
    logger.info(JSON.stringify(instance.instance_values[0]))
    logger.info(req.body.started)
    if (req.body.started === 'true') {
      // TODO the following command terminates the detached command 
      RPCManager.createSession(instance.name, instance.instance_values[0].RPC, function startedSession (err, instance) {
        if (err) logger.error(err)
        logger.info('Starting the session')
        // TODO update the returned variable before sending it back.
        Instances.findOneAndUpdate({'name': req.params.instanceId}, {$set: {'started': req.body.started}}, {new: true}, function (err, instance) {
          if (err) {
            logger.error(err)
            return next(err)
          }
          res.json(instance)
        })
      })
    } else {
      RPCManager.stopSession(instance.name, instance.instance_values[0].RPC, function startedSession (err, instance) {
        if (err) logger.error(err)
        logger.info('Stopping the session')
        // TODO update the returned variable before sending it back.
        Instances.findOneAndUpdate({'name': req.params.instanceId}, {$set: {'started': req.body.started}}, {new: true}, function (err, instance) {
          if (err) {
            logger.error(err)
            return next(err)
          }
          res.json(instance)
        })
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
      logger.error('error in getInstanceDetail')
      return next(err)
    }
    res.json(instance)
  })
}

/**
 * updateInstances - Same as updateInstance but for all the instances. Currently not used, as the logic doesn't yet make sense.
 *
 * @param req - not used
 * @param res - All the instances. 
 * @param next - Error
 * @returns {undefined}
 */
module.exports.updateInstances = function updateInstances (req, res, next) {
  Instances.find({}, function updateInstance (err, instances) {
    if (err) {
      logger.error(err)
      return next(err)
    }
    for (var i = 0; i < instances.length; i++) {
      (function () {
        var name = instances[i].name
        Instances.findOneAndUpdate({'name': name}, {$set: req.body}, {new: true}, function (err, instance) {
          if (err) {
            logger.error(err)
            return next(err)
          }
        })
      })()
    }
  })
  Instances.find({}, function (err, instances) {
    if (err) {
      logger.error('error in update')
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
    if (err) {
      logger.error(err)
      return next(err)
    }
    logger.info(instances.length)
    res.json(instances)
  })
}
