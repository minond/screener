'use strict';

// var webdriver = require('selenium-webdriver');
//
// var driver = new webdriver.Builder()
//     .withCapabilities(webdriver.Capabilities.chrome())
//     .build();
//
// driver.get('http://www.google.com');
// driver.getTitle().then(function(title) {
//     console.log(title);
// });

var fs = require('fs'),
    webdriver = require('selenium-webdriver'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer('./bin/selenium-server-standalone-2.42.1.jar', {
  port: 4444
});

server.start();

var driver = new webdriver.Builder().
    usingServer(server.address()).
    withCapabilities(webdriver.Capabilities.chrome()).
    build();

driver.get('http://www.google.com');

driver.getTitle().then(function (title) {
    console.log(title);
});

driver.takeScreenshot().then(function (data) {
    fs.writeFileSync('./out.png', data, 'base64');
});
