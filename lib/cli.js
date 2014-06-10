'use strict';

var CMD_PHANTOMJS = 'node_modules/.bin/phantomjs',
    ARG_SNAPSHOT = 'snapshot';

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

module.exports = {
    build: build,
    show: show
};
