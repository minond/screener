'use strict';

var STAT_SUCCESS = 'success',
    DEFAULT_OUT_FORMAT = '.png',
    DEFAULT_FILE_DELIM = '-';

var lodash = require('lodash'),
    fs = require('fs'),
    log = require('./log'),
    Code = require('./code');

var jquery = 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js';

if (!fs.separator) {
    // in node
    fs.separator = require('path').sep;
}

/**
 * @example
 *     tests/screenshots/originals/features-search-form.png
 *     ^                 ^         ^
 *     |                 |         |
 *     dir               group     label
 *
 * @param {string} dir direcotry of file
 * @param {string} group
 * @param {string} label unique identifier for file
 * @return {string} path to a file
 */
function get_file_name (dir, group, label) {
    var file;

    file = group + DEFAULT_FILE_DELIM + label;
    file = file.replace(/\W+/g, DEFAULT_FILE_DELIM);
    file = file + DEFAULT_OUT_FORMAT;
    file = dir + fs.separator + file;

    return file;
}

/**
 * @param {string} label
 * @param {string} dir directory all images are saved to
 * @param {Object} test normalized test
 * @param {phantom.webpage} page webpage instance
 * @param {Function} callback
 * @return {void}
 */
function execute(label, dir, test, page, callback) {
    var file, msg,
        test_label = '[' + label + ']';

    log.debug(test_label, 'loading', test.config.get);
    page.open(test.config.get, function (stat) {
        if (stat !== STAT_SUCCESS) {
            msg = 'failed to load ' + test.config.get;
            log.error(test_label, msg);
            log.user('fail');
            callback(new Error(msg));
        }

        log.debug(test_label, 'importing helper libraries');
        page.includeJs(jquery, function () {
            lodash.each(test.executions, function (list, test) {
                file = get_file_name(dir, label, test);

                lodash.each(list, function (item) {
                    // other future webpage actions go here
                    if (item instanceof Code) {
                        log.debug(test_label, 'executing code for', test);
                        page.evaluate(item.toFunction());
                    }
                });

                log.user('pass');
                log.debug(test_label, 'saving to', file);
                page.render(file);
            });

            callback();
        });
    });
}

/**
 * converts test configuration format into an object with sections that are
 * easily worked with by runner.execute
 *
 * @example input
 *     {
 *         "google": [
 *             "config": {
 *                 "get": "https://www.google.com/"
 *             },
 *             "tests": {
 *                 "check a checkbox": [
 *                     {
 *                         "attr": [
 *                             "input[type=checkbox]",
 *                             "checked",
 *                             "checked"
 *                         ]
 *                     }
 *                 ],
 *                 "set value of search field": [
 *                     {
 *                         "css": [
 *                             "div",
 *                             "background-color",
 *                             "blue"
 *                         ]
 *                     },
 *                     {
 *                         "value": [
 *                             "input[name=q]",
 *                             "PhantomJS..."
 *                         ]
 *                     }
 *                 ]
 *             }
 *         ]
 *     }
 *
 * @example output
 *     {
 *         "features": {
 *             "config": same as config object in configuration,
 *             "executions": {
 *                 "test this thing about features page": [
 *                     new Code,
 *                     new Code,
 *                     new Action,
 *                 ],
 *                 "test this other thing about features page": [
 *                     new Action,
 *                     new Code,
 *                     new Code,
 *                 ],
 *             }
 *         }
 *     }
 *
 * @param {Object} tests tests in formated for configuration files
 * @return {Object}
 */
function normalize (tests) {
    var storage, code, normalized = {};

    lodash.each(tests, function (test, label) {
        storage = normalized[ label ] = {
            config: test.config,
            executions: {}
        };

        log.debug('building', label);
        lodash.each(test.tests, function (steps, label) {
            log.debug('generating', label);
            storage.executions[ label ] = [];

            lodash.each(steps, function (step) {
                lodash.each(step, function (args, action) {
                    log.debug('evaluating', action, JSON.stringify(args));

                    switch (action) {
                        // other future phantom.webpage actions go here
                        // js to execute
                        default:
                            code = new Code();
                            code.add(action, args);

                            log.debug('saving code:', code);
                            storage.executions[ label ].push(code);

                            break;
                    }
                });
            });
        });

        log.debug('');
    });

    return normalized;
}

module.exports = {
    get_file_name: get_file_name,
    normalize: normalize,
    execute: execute
};
