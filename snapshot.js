'use strict';

/* globals phantom */
var page = require('webpage').create(),
    system = require('system');

var site = system.args[1],
    file = system.args[2];

page.open(site, function (stat) {
    page.render(file);
    phantom.exit();
});
