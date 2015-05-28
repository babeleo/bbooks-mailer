'use strict'

class ProviderInterface {
    constructor(params) {
        params = params || {}
        this.provider = params.provider
    }
    send() {
        console.log('Sending email to:', arguments[0].to, 'with', this.provider)
    }
}


module.exports = ProviderInterface
