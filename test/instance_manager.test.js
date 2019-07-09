/**
 * This test is to routes and creation checks.
 *
 */
var mongoose = require('mongoose')
var request = require('supertest')
var express = require('express')
var chai = require('chai')
var expect = chai.expect

var Docker = require('dockerode')
var docker = new Docker()
var assert = require('assert')

var config = require('../config/config')
var logger = require('../models/Logger')
var url = 'mongodb://' + config.mongodb_ip + ':' + config.mongodb_port + '/instances'
var Server = require('../models/Server')
mongoose.Promise = global.Promise
mongoose.connect(url, { useMongoClient: true })
var db = mongoose.connection
describe('Test Environment', () => {
  describe('Check if mongo is working', () => {
    it('Check if mongo is in Valid state', done => {
      db.on('error', (error) => {
        logger.error.bind(console, done(error))
      })
      return done()
    })
  })
})
const server = new Server()
server.listen({})
/**
 * Check whether instance route to root location is undefined.
 */
describe('Test server', () => {
  describe('Check invalid location', () => {
    it('Check route for invalid position', done => {
      request(server.server_)
        .get('/')
        .expect(404, done)
    })
  })

  describe('Get instances', () => {
    it('Get all instances', done => {
      request(server.server_)
        .get('/instances')
        .expect(200, done)
    })
  })

  describe('Create an instances and delete it with request to root.', () => {
    it('Create an instance', done => {
      request(server.server_)
        .post('/instances')
        .send({ 'instance_name': 'test_instance', 'vision_tool': 'cmt', 'chatbot': 'opencog' })
        .expect(200, done)
    }).timeout(0)

    it('Request to root to delete it.', done => {
      request(server.server_)
        .delete('/instances')
        .expect(200, done)
    }).timeout(0)
  })

  describe('Create a new instances named test_instance to check for delete specific instance', () => {
    it('Create an instance', done => {
      request(server.server_)
        .post('/instances')
        .send({ 'instance_name': 'test_instance', 'vision_tool': 'cmt', 'chatbot': 'opencog' })
        .expect(200, done)
    }).timeout(0)

    it('Delete specific instances', done => {
      request(server.server_)
        .delete('/instances/test_instance')
        .expect(200, done)
    }).timeout(0)
  })

  describe('Create one instance and start it', () => {
    it(': Create a specific instances', done => {
      request(server.server_)
        .post('/instances')
        .send({ 'instance_name': 'test_instance_start_stop_1', 'vision_tool': 'cmt', 'chatbot': 'opencog' })
        .expect(200, done)
    }).timeout(0)

    it(': Start a specific instances', done => {
      request(server.server_)
        .put('/instances/test_instance_start_stop_1')
        .send({ started: 'true' })
        .expect(200, done)
    }).timeout(0)

    it(': Stop a specific instances', done => {
      request(server.server_)
        .put('/instances/test_instance_start_stop_1')
        .send({ started: 'false' })
        .expect(200, done)
    }).timeout(0)

    it(': Delete a specific instances', done => {
      request(server.server_)
        .delete('/instances/test_instance_start_stop_1')
        .expect(200, done)
    }).timeout(0)
  })
})
describe('Testing docker container with dockerode and with values here to check validity of containers created', () => {
  describe('Create an instances and delete it with request to root.', () => {
    it('Create an instance', done => {
      request(server.server_)
        .post('/instances')
        .send({ 'instance_name': 'test_instance', 'vision_tool': 'cmt', 'chatbot': 'opencog' })
        .expect(200, done)
    }).timeout(0)

    it('Check docker container does exists', done => {
      var container = docker.getContainer('test_instance')
      container.inspect((err, data) => {
        if (err) done(err)
        console.log('Started Container ' + data.State.Running)
        done()
      })
    }).timeout(0)
    it('Delete', done => {
      request(server.server_)
        .delete('/instances')
        .expect(200, done)
    }).timeout(0)
  })
  describe('Does it trigger valid run commands', () => {
    it('Create an instance', done => {
      request(server.server_)
        .post('/instances')
        .send({ 'instance_name': 'test_instance', 'vision_tool': 'cmt', 'chatbot': 'opencog' })
        .expect(200, done)
    }).timeout(0)

    it('Get specific instances', done => {
      request(server.server_)
        .get('/instances/test_instance')
        .expect(200, done)
    })

    it(': Start a specific instances is this where', done => {
      request(server.server_)
        .put('/instances/test_instance')
        .send({ started: 'true' })
        .expect(200, done)
        .expect(function (res) {
            console.log(res)
        })
    }).timeout(0)

    it(': Check if its started at all', done => {
      var container = docker.getContainer('test_instance')
      container.inspect((err, data) => {
        if (err) done(err)
        console.log('Started Contaienr ' + data.State)
        done()
      })
    })

    it('Delete', done => {
      request(server.server_)
        .delete('/instances')
        .expect(200, done)
    }).timeout(0)
  })
})
