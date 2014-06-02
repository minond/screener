'use strict';

/* global phantom */

var DEFAULT_OUT_DIR = '.screener';
var DEFAULT_TESTS_FILE = 'tests.json';

var tests;

var webpage = require('webpage'),
    system = require('system'),
    lodash = require('lodash'),
    fs = require('fs'),
    log = require('./lib/log.js'),
    runner = require('./lib/runner.js');

var page = webpage.create(),
    file = system.args[1] || DEFAULT_TESTS_FILE,
    dir = system.args[2] || DEFAULT_OUT_DIR,
    normalized = {};

// require as local file
tests = require('.' + fs.separator + file);

try {
    normalized = runner.normalize(tests);
} catch (err) {
    log.error(err.message);
    phantom.exit(1);
}

lodash.each(normalized, function (test, label) {
    log.debug('testing', label);
    runner.execute(label, dir, test, page, phantom);
});
