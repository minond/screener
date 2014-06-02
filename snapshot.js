'use strict';

/* global phantom */

var DEFAULT_OUT_DIR = '.screener';

var webpage = require('webpage'),
    system = require('system'),
    lodash = require('lodash'),
    tests = require('./tests.json'),
    log = require('./lib/log.js'),
    runner = require('./lib/runner.js');

var page = webpage.create(),
    dir = system.args[1] || DEFAULT_OUT_DIR,
    normalized = {};

try {
    normalized = runner.normalize(tests);
} catch (err) {
    log.error(err.message);
    phantom.exit(1);
}

lodash.each(normalized, function (info, label) {
    log.debug('testing', label);
    runner.execute(label, dir, info.url, info.executions, page, phantom);
});

