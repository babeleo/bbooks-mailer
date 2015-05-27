'use strict'

var mongoose = require('mongoose')
var async = require('async')

require('../../models/')

var MailTask
var self

class Mailer {

    constructor(params) {
        self = this
        self.running = false
        self.tasksInProgress = []
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
        if (!self.isRunning) {
            console.log('starting')

            self.running = true

            // creating queue with "send" worker and concurrency 4
            if (self.queue) {
                self.queue.resume()
            } else {
                self.queue = async.priorityQueue(self.send, 4)
            }

            self.waitInit = setInterval(function() {
                if (!!self.connection._hasOpened) { // now we can start checking
                    self.checkNew()
                    self.interval = setInterval(function() {
                        self.checkNew()
                    }, self.checkInterval)
                    clearInterval(self.waitInit)
                }
            }, 1000)
        } else {
            console.log('Already started')
        }

        return self
    }

    stop() {
        self.running = false
        self.queue.pause()
        clearInterval(self.interval)
        return self
    }

    pushTask(task, callback) {
        task.set('started', new Date())
        task.save(function(err) {
            self.tasksInProgress.push(task.id)
            self.queue.push(task.id, task.priority, function() {
                self.taskDone(task)
            })
        })
    }

    taskDone(task) {
        task.set('finished', new Date())
        task.save(function () {
            var index = self.tasksInProgress.indexOf(task.id)
            if (index > -1) {
                self.tasksInProgress.splice(index, 1)
            }
        })
    }

    send(taskId, callback) {
        console.log('Calling send for', taskId)
        setTimeout(function () {
            callback()
        }, 10000)
            // var Sender = require('./providers/aws-ses')
            // var sender = new Sender()
            // sender.send(task, callback)
    }

    checkNew() {
        if (self.checkBlocked) {
            return
        } else {
            self.checkBlocked = true
            MailTask
                .findOne({
                    _id: {
                        $nin: self.tasksInProgress
                    },
                    finished: {
                        $exists: false
                    }
                })
                .sort('-urgency -created')
                .exec(function(err, task) {
                    if (task) {
                        self.pushTask(task, function() {
                            self.checkBlocked = false
                        })
                    } else {
                        self.checkBlocked = false
                    }
                })
        }
    }

    get isRunning() {
        return self.running
    }
}

module.exports = Mailer
