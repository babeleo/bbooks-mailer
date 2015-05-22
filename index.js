'use strict'

var Mailer = require('./lib/mailer/')
var mailer = new Mailer()
mailer.start({checkInterval: 5000})

setTimeout(function () {
    console.log('stopping')
    mailer.stop()
}, 5000)
