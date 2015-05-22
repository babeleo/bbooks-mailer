'use strict'

var mongoose = require('mongoose')
var async = require('async')

require('../../models/')
var MailTask

class Mailer {

    constructor(params) {
        var self = this
        self.running = false
        self.connection = mongoose.createConnection(process.env.MONGO_URL)
        self.checkInterval = (params && params.checkInterval) || 5000
        self.connection.on('open', function() {
            MailTask = self.connection.model('MailTask')
        })
        self.connection.on('error', function() {
            throw ('Can\'t connect to DB\nCheck your\'s process.env.MONGO_URL')
        })
    }

    start() {
        var self = this
        console.log('starting')
        self.running = true
        self.waitInit = setInterval(function() {
            if (!!self.connection._hasOpened) { // now we can start checking
                self.checkNew()
                self.interval = setInterval(function() {
                    self.checkNew()
                }, self.checkInterval)
                clearInterval(self.waitInit)
            }
        }, 1000)
        return self
    }

    stop() {
        var self = this
        self.running = false
        clearInterval(self.interval)
        return self
    }

    send(task, callback) {
        var Sender = require('./providers/aws-ses')
        var sender = new Sender()
        sender.send(task, callback)
    }

    checkNew() {
        var self = this

        MailTask
            .findOne({
                finished: {
                    $exists: false
                }
            })
            .sort('-urgency -created')
            .exec(function(err, task) {
                console.log(err, task)
            })
    }
    
    get isRunning(){
        return this.running
    }
}

module.exports = Mailer
