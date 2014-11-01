'use strict';

var CMD_PHANTOMJS = 'phantomjs',
    ARG_SNAPSHOT = __dirname + '/../snapshot',
    TEST_DIR_OUT = '.tmp';

var spawn = require('child_process').spawn,
    path = require('path'),
    lodash = require('lodash'),
    runner = require('./runner'),
    config = require('../config/config.json');

/**
 * convers tests object into array with info for ever test
 *
 * @example output
 *     [
 *         {
 *             group: 'Google',
 *             label: 'fill out search form',
 *             file: 'screener/originals/google.fill-out-search-form.png'
 *         }
 *     ]
 *
 * @method normalize
 * @param {Object} screener
 * @param {Object} tests
 * @return {Array}
 */
function normalize (screener, tests) {
    var normal = [];

    lodash.each(tests, function (config, group) {
        lodash.each(config.tests, function (test, label) {
            normal.push({
                group: group,
                label: label,
                file: runner.get_file_name(screener.output, group, label)
            });
        });
    });

    return normal;
}

/**
 * @method show
 * @param {Object} screener
 * @return {Function}
 */
function show (screener) {
    return function (options) {
        var Table = require('cli-table'),
            tests = normalize(screener, require(path.resolve('.', screener.config)));

        var table = new Table({
                style: { head: ['white'] },
                head: ['Group', 'Test', 'File']
            });

        lodash.each(tests, function (test) {
            table.push([ test.group, test.label, test.file ]);
        });

        console.log(table.toString());
    };
}

/**
 * @method build
 * @param {Object} screener
 * @return {Function}
 */
function build (screener) {
    return function () {
        var ProgressBar = require('progress');

        var args = [ARG_SNAPSHOT, screener.config, screener.output],
            snapshot = spawn(CMD_PHANTOMJS, args),
            tests = normalize(screener, require(path.resolve('.', screener.config))),
            total = tests.length,
            pass_count = 0;

        var bar = new ProgressBar('building [:bar] :current/:total', {
            total: total,
            width: 50
        });

        snapshot.stdout.on('data', function (data) {
            // probably not the best way...
            switch (data.toString().trim()) {
                case 'pass':
                    bar.tick();
                    pass_count++;
                    break;

                case 'fail':
                    bar.tick();
                    break;
            }
        });

        snapshot.on('close', function () {
            console.log('');
            console.log('%s of %s ok', pass_count, total);
            process.exit(pass_count === total ? 0 : 1);
        });
    };
}

function test (screener) {
    return function () {
        var ProgressBar = require('progress'),
            image_diff = require('image-diff'),
            color = require('cli-color');

        var args = [ARG_SNAPSHOT, screener.config, TEST_DIR_OUT],
            snapshot = spawn(CMD_PHANTOMJS, args),
            tests = normalize(screener, require(path.resolve('.', screener.config))),
            total = tests.length,
            check_count = 0,
            pass_count = 0;

        var bar = new ProgressBar('getting updates [:bar] :current/:total', {
            total: total,
            width: 50
        });

        var c_group = color.xterm(8),
            c_label = color.xterm(7),
            c_pass = color.xterm(35),
            c_fail = color.xterm(196);

        snapshot.stdout.on('data', function (data) {
            // probably not the best way...
            switch (data.toString().trim()) {
                case 'pass':
                case 'fail':
                    bar.tick();
                    break;
            }
        });

        snapshot.on('close', function () {
            console.log('');

            lodash.each(tests, function (test) {
                var orignal = test.file,
                    update = runner.get_file_name(TEST_DIR_OUT, test.group, test.label),
                    diff = runner.get_file_name(TEST_DIR_OUT, test.group, test.label + '-diff');

                image_diff({
                    actualImage: update,
                    expectedImage: orignal,
                    diffImage: diff,
                }, function (err, same) {
                    check_count++;

                    if (err) {
                        console.log('error checking [%s] %s', test.group, test.label);
                    } else if (!same) {
                        console.log('%s %s: %s', c_group(test.group), c_label(test.label), c_fail('✕'));
                    } else {
                        console.log('%s %s: %s', c_group(test.group), c_label(test.label), c_pass('✓'));
                        pass_count++;
                    }

                    if (check_count === total) {
                        console.log('');
                        console.log('%s of %s ok', pass_count, total);
                        process.exit(pass_count === total ? 0 : 1);
                    }
                });
            });
        });
    }
}

module.exports = {
    build: build,
    test: test,
    show: show
};