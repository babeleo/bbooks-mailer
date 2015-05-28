'use strict'

var ProviderInterface = require('../provider-interface')
var AWS = require('aws-sdk')
var ses = new AWS.SES()

class Sender extends ProviderInterface {
    constructor(params){
        params = params || {}
        params.provider = 'aws-ses'
        super(params)
    }

    send(task, callback){
        super.send(task)
        // console.log('sent')
        // callback(null)

    }
}

module.exports = Sender
