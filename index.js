'use strict'

var Mailer = require('./lib/mailer/')
var mailer = new Mailer()

setTimeout(function () {
    mailer.start({checkInterval: 5000})
}, 3000)
