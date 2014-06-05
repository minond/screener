'use strict';

var DEBUG = true,
    ERROR = true;

/**
 * @param {string} text*
 */
function debug () {
    if (DEBUG) {
        console.log.apply(console, arguments);
    }
}

/**
 * @param {string} text*
 */
function error () {
    if (ERROR) {
        console.log.apply(console, arguments);
    }
}

module.exports = {
    debug: debug,
    error: error
};
