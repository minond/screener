'use strict';

var write = require('fs').writeFileSync,
    debug = require('debug')('screener:snapshot');

/**
 * generates a function that saved data to a file
 * @function save
 * @param {String} file
 * @return {Function} a function that takes data that should be saved
 */
function save(file) {
    return function saver(data) {
        write(file, data, 'base64');
        debug('saved screenshot to %s', file);
    };
}

/**
 * generates a function that logs text next time it is called
 * @function ddebug
 * @param {*} args*
 * @return {Function} logs on execution
 */
function ddebug() {
    var args = arguments;

    return function ldebug() {
        return debug.apply(debug, args);
    };
}

/**
 * @function snapshot
 * @param {String} url
 * @param {String} file
 * @param {String} capability
 * @return {String} save path
 */
module.exports = function snapshot(url, file, capability) {
    var driver = require('./driver')(capability);

    driver.get(url)
        .then(ddebug('loaded %s', url));

    driver.takeScreenshot()
        .then(save(file));

    driver.close()
        .then(ddebug('closing driver'));
};
