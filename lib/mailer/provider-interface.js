'use strict'

class ProviderInterface {
    constructor() {

    }
    send() {
        console.log('Sending email to:', arguments[0].to)
    }
}


module.exports = ProviderInterface
