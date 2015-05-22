var mongoose = require('mongoose')

var mailTask = new mongoose.Schema({
    __v: {
        select: false
    },
    to: 'string',
    from: 'string',
    subject: 'string',
    body: 'string',
    provider: {type: 'string'},
    urgency: {
        type: 'number',
        default: 0
    },
    created: 'date',
    started: 'date',
    finished: 'date',
    status: 'string',
    log: [{
        _id: false,
        logged: 'date',
        message: 'string',
        type: {
            type: 'string'
        }
    }]
})


mailTask.pre('save', function(next) {
    this.created = this.created || new Date()
    next()
})

mailTask.set('collection', 'mailTasks')

module.exports = mongoose.model('MailTask', mailTask)
