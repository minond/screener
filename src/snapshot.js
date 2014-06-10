'use strict';

/**
 * @usage phantomjs snapshot.js [tests] [output]
 * loads tests file and executes and saves them
 */

/* global phantom */
var webpage = require('webpage'),
    system = require('system'),
    lodash = require('lodash'),
    fs = require('fs'),
    log = require('../lib/log'),
    runner = require('../lib/runner'),
    config = require('../config/config.json');

var pwd = fs.workingDirectory + fs.separator,
    file = pwd + (system.args[1] || config.DEFAULT_TESTS_FILE),
    dir = pwd + (system.args[2] || config.DEFAULT_OUT_DIR),
    normalized = {},
    tests = {};

var total_count = 0,
    test_count = 0,
    fail_count = 0;

try {
    tests = require(fs.separator + file);
    normalized = runner.normalize(tests);
    total_count = Object.keys(normalized).length;
} catch (err) {
    log.error(err.message);
    phantom.exit(1);
}

lodash.each(normalized, function (test, label) {
    var page = webpage.create();

    runner.execute(label, dir, test, page, function (err) {
        test_count++;

        if (err) {
            fail_count++;
        }

        if (total_count === test_count) {
            log.debug('');
            log.debug(test_count - fail_count, 'out of', test_count, 'builds ok');
            phantom.exit();
        }
    });
});
