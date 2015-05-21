var gulp = require('gulp')
var fs = require('fs-extra')
var exec = require('live-exec')

var config = require('./tools/config')

// modify standard config
if (fs.existsSync('./tools/config.mod.js')) {
    require('./tools/config.mod')
}

gulp.task('start', function (done) {
    var command = 'node-dev index.js'
    exec(command, {env: config.env}, done)
})

gulp.task('test', function (done) {
    done()
})
