'use strict';

var DEBUG = false,
    ERROR = false,
    USER = true;

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
        console.error.apply(console, arguments);
    }
}

/**
 * @param {string} text*
 */
function user () {
    if (USER) {
        console.info.apply(console, arguments);
    }
}

module.exports = {
    user: user,
    debug: debug,
    error: error
};
