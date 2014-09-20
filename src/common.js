var path = require('path');

var common = {}


common.randomInt = function(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

module.exports = common;
