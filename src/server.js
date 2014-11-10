'use strict';

var acm = require('acm');

var selenium_jar = acm.get('screener.selenium.jar') || './bin/selenium-server-standalone-2.42.1.jar',
    selenium_port = acm.get('screener.selenium.port') || 4444;

var debug = require('debug')('screener:server'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer(selenium_jar, {
    port: selenium_port
});

debug('starting selenium server on port %s', selenium_port);
server.start();

module.exports = server;
