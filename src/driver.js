'use strict';

var server = require('./server'),
    debug = require('debug')('screener:driver');

var Builder = require('selenium-webdriver').Builder,
    Capabilities = require('selenium-webdriver').Capabilities;

/**
 * @function driver
 * @param {String} capability
 * @return {selenium-webdriver.Builder}
 */
module.exports = function driver(capability) {
    debug('creating %s driver', capability);

    return new Builder()
        .usingServer(server.address())
        .withCapabilities(Capabilities[ capability ]())
        .build();
};
