'use strict';

var L_DEBUG = true;
var L_ERROR = true;

/**
 * @param {string} text*
 */
function debug () {
    if (L_DEBUG) {
        console.log.apply(console, arguments);
    }
}

/**
 * @param {string} text*
 */
function error () {
    if (L_ERROR) {
        console.log.apply(console, arguments);
    }
}

module.exports = {
    debug: debug,
    error: error
};
