'use strict';

var SELENIUM_JAR = './bin/selenium-server-standalone-2.42.1.jar',
    SELENIUM_PORT = 4444;

var debug = require('debug')('screener:server'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer(SELENIUM_JAR, {
    port: SELENIUM_PORT
});

debug('starting selenium server on port %s', SELENIUM_PORT);
server.start();

module.exports = server;
