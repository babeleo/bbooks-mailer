'use strict'

var ProviderInterface = require('../provider-interface')
var AWS = require('aws-sdk')
var ses = new AWS.SES()

class Sender extends ProviderInterface {
    constructor(params) {
        super(params)
        console.log('constructor')
    }
    send(task, callback){
        super.send(task, callback)
        console.log('sent')
        callback()
    }
}

module.exports = Sender
