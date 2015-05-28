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
        self.checkInterval = params && params.checkInterval || 5000
        self.concurrency = params && params.concurrency || 4
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

            // creating queue with "send" worker and provided concurrency
            if (self.queue) {
                self.queue.resume()
            } else {
                self.queue = async.priorityQueue(self.send, self.concurrency)
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
        console.log('stopping')
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
        task.save(function() {
            // drop from tasks, that currently in progress
            var index = self.tasksInProgress.indexOf(task.id)
            if (index > -1) {
                self.tasksInProgress.splice(index, 1)
            }
        })
    }

    send(taskId, callback) {
        console.log('Calling send for', taskId)
        async.waterfall([
                function(cb) {
                    MailTask.findOne({
                        _id: taskId
                    }, cb)
                },
                function(task, cb) {
                    var i = 0
                    var taskCompleted = false
                    var exitFlag = false

                    async.doWhilst( // try various providers to provide better mail delivery
                        function(cb) {
                            var Sender
                            try {
                                Sender = (i === 0) ? require('./providers/' + task.provider.toLowerCase()) : require('./providers/' + self.providers[i])
                            } catch (e) {
                                Sender = self.providers[i] && require('./providers/' + self.providers[i])
                            }
                            if (!Sender || !self.providers) {
                                console.log('No email providers found')
                                exitFlag = true
                                self.stop()
                                cb()
                            } else {
                                var sender = new Sender()
                                sender.send(task, function(err) {
                                    console.log('err', err)
                                    if (err) {
                                        i = i + 1
                                        cb()
                                    } else {
                                        taskCompleted = true
                                        cb()
                                    }
                                })
                            }
                        },
                        function() {
                            return i > self.providers.length && (!taskCompleted || exitFlag)
                        },
                        function(err) {
                            if (!taskCompleted) {
                                cb('Error: task', task._id, 'was not completed')
                            } else {
                                cb(null)
                            }
                        })
                }
            ],
            function(err) {
                if (!err) {
                    callback()
                }
            })
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

    get providers() {
        var providers = process.env.PROVIDERS_PRIORITY.replace(/ /g, '').toLowerCase().split(',')

        providers = providers.filter(function(provider) {
            try {
                require('./providers/' + provider)
            } catch (e) {
                return false
            }
            return true
        })

        return providers
    }

    get defaultProvider() {
        return self.providers[0] || undefined
    }

}

module.exports = Mailer
