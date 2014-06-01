'use strict';

var STAT_SUCCESS = 'success';
var DEFAULT_OUT_FORMAT = '.png';
var DEFAULT_FILE_DELIM = '-';

var lodash = require('lodash'),
    log = require('./log.js');

/**
 * @example tests/screenshots/originals/features-search-form.png
 * @param {string} dir direcotry of file
 * @param {string} label unique identifier for file
 * @return {string} path to a file
 */
function get_file_name (dir, group, label) {
    var file;

    file = group + DEFAULT_FILE_DELIM + label;
    file = file.replace(/\W+/g, DEFAULT_FILE_DELIM);
    file = file + DEFAULT_OUT_FORMAT;
    file = dir + '/' + file;

    return file;
}

/**
 * @param {string} dir directory all images are saved to
 * @param {string} dir directory all images are saved to
 * @param {string} url url of the page in testing
 * @param {Object} executions test labels as keys and Code objects as values
 * @param {phantom.webpage} page webpage instance
 * @param {phantom} phantom global/mocked instance. used to end process
 * @return {void}
 */
function execute(label, dir, url, executions, page, phantom) {
    var file, jquery = 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js';

    log.debug('loading', url);
    page.open(url, function (stat) {
        if (stat !== STAT_SUCCESS) {
            log.error('failed to load', url);
            phantom.exit(1);
        }

        log.debug('importing helper libraries');
        page.includeJs(jquery, function () {
            lodash.each(executions, function (code, test) {
                file = get_file_name(dir, label, test);

                log.debug('executing code for', test);
                page.evaluate(code.toString());

                log.debug('saving to', file);
                page.render(file);
            });

            phantom.exit(0);
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
 *             "https://www.google.com/",
 *             {
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
 *             "url": "http...",
 *             "executions": {
 *                 "test this thing about features page": new Code,
 *                 "test this other thing about features page": new Code
 *             }
 *         }
 *     }
 *
 * @param {Object} tests tests in formated for configuration files
 * @return {Object}
 */
function normalize (tests) {
    var url, storage, normalized = {};

    lodash.each(tests, function (tests, label) {
        url = tests.shift();
        storage = normalized[ label ] = {
            url: url,
            executions: {}
        };

        log.debug(label, '-', url);
        lodash.each(tests, function (tests, index) {
            lodash.each(tests, function (steps, test) {
                code = new Code();

                log.debug('staging', test);
                lodash.each(steps, function (step) {
                    lodash.each(step, function (args, action) {
                        log.debug('evaluating', action, JSON.stringify(args));
                        code.add(action, args);
                    });
                });

                log.debug('saving code:');
                log.debug(code);
                storage.executions[ test ] = code;
            });
        });
    });

    return normalized;
}

module.exports.normalize = normalize;
module.exports.execute = execute;
