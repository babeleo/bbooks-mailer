'use strict'

class ProviderInterface {
    constructor() {

    }
    send(task, callback) {
        console.log('Sending email to:', task.to)
    }
}


module.exports = ProviderInterface
