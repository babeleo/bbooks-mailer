var gulp = require('gulp')
var fs = require('fs-extra')

var config = require('./tools/config')

// modify standard config
if (fs.existsSync('./tools/config.mod.js')) {
    require('./tools/config.mod')
}
