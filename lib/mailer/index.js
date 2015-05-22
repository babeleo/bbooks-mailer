'use strict'

var mongoose = require('mongoose')
require('../../models/')
var MailTask

class Mailer {
    constructor(params) {
        var self = this
        this.running = false
        this.connection = mongoose.createConnection(process.env.MONGO_URL)
        this.checkInterval = (params && params.checkInterval) || 5000
        this.connection.on('open', function() {
            console.log('Connected')
            MailTask = self.connection.model('MailTask')
        })
        this.connection.on('error', function() {
            throw ('Can\'t connect to DB\nCheck your\'s process.env.MONGO_URL')
        })
    }
    start() {
        var self = this
        console.log('starting')
        self.running = true
        self.checkNew()
        self.interval = setInterval(function(){self.checkNew()}, self.checkInterval)
        return this
    }
    stop() {
        this.running = false
        return this
    }
    checkNew(){
        console.log('Checking!')
        MailTask.find({}, function (err, data) {
            console.log(err, data)
        })
    }
}

module.exports = Mailer
