'use strict';

/**
 * @usage phantomjs snapshot.js [tests] [output]
 * loads tests file and executes and saves them
 */

/* global phantom */
var DEFAULT_OUT_DIR = '.screener',
    DEFAULT_TESTS_FILE = 'tests.json';

var webpage = require('webpage'),
    system = require('system'),
    lodash = require('lodash'),
    fs = require('fs'),
    log = require('./lib/log.js'),
    runner = require('./lib/runner.js');

var file = system.args[1] || DEFAULT_TESTS_FILE,
    dir = system.args[2] || DEFAULT_OUT_DIR,
    normalized = {},
    tests = {};

var test_count = 0,
    fail_count = 0;

try {
    tests = require('.' + fs.separator + file);
    normalized = runner.normalize(tests);
} catch (err) {
    log.error(err.message);
    phantom.exit(1);
}

(function next() {
    var tests = Object.keys(normalized),
        test = tests.shift(),
        data = normalized[ test ],
        page = webpage.create();

    if (test_count) {
        log.debug('');
    }

    if (test) {
        test_count++;
        log.debug('testing', test);
        delete normalized[ test ];
        runner.execute(test, dir, data, page, next, function () {
            fail_count++;
            next();
        });
    } else {
        log.debug(test_count - fail_count, 'out of', test_count, 'builds ok');
        phantom.exit(fail_count);
    }
})();
