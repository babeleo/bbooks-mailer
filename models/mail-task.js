var mongoose = require('mongoose')

var mailTask = new mongoose.Schema({
    // __v: {
    //     select: false
    // },
    to: String,
    from: String,
    subject: String,
    body: String,
    provider: String,
    urgency: {
        type: Number,
        default: 0
    },
    created: Date,
    started: Date,
    finished: Date,
    status: String,
    log: [{
        _id: false,
        logged: Date,
        message: String,
        type: {
            type: String
        }
    }]
})


mailTask.pre('save', function(next) {
    this.created = this.created || new Date()
    next()
})

mailTask.set('collection', 'mailTasks')

module.exports = mongoose.model('MailTask', mailTask)
