'use strict';
/* globals $ */

// var Configuration = require('acm').Configuration,
//     config = new Configuration({ project_root: __dirname });
//
// var program = require('commander')
//     .option('-c, --configuration <file>', 'configuration file', 'tests/snapshots/config.yml')
//     .version(require('./package.json').version);
//
// program
//     .command('fetch')
//     .description('updates reference images')
//     .action(function () {
//         console.log(program.configuration);
//     });
//
// program.parse(process.argv);
//
// if (program.configuration) {
//     config.$file_links.base = program.configuration;
// }
//
// if (!program.args.length) {
//     program.help();
// }


var phantomjs = require('phantom'),
    diff = require('image-diff'),
    debug = require('debug'),
    slog = debug('screener');

var site = process.argv[2],
    file = process.argv[3];

if (site && file) {
phantomjs.create(function (phantom) {
    phantom.createPage(function (page) {
        page.open(site, function (stat) {
            page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js', function () {
                page.evaluate(function () {
                    return $('div').text();
                }, function () {
                    console.log(arguments);
                    page.render(file, function () {
                        phantom.exit();
                    });
                });
            });
        });
    });
});
}


/**
 * test started
 * @param {String} url
 * @param {Function} loaded
 */
var load = (function screener() {
    var tests_complete = 0,
        tests_requested = 0;

    function name2file(name) {
        return name.replace(/\W+/g, '-') + '.png';
    }

    return function load(url, loaded) {
        var log = debug('screener:' + url);

        phantomjs.create(function (phantom) {
            slog('creating phantom instance');

            phantom.createPage(function (page) {
                slog('creating page');

                loaded(function snapshot(name, code) {
                    var file = name2file(name);
                    log('loading %s to test %s', url, name);

                    page.open(url, function () {
                        tests_requested++;

                        page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js', function () {
                            log('execuding code');

                            page.evaluate(code, function () {
                                tests_complete++;

                                log('saving to %s', file);
                                page.render(file, function () {
                                    log('test complete');

                                    if (tests_complete === tests_requested) {
                                        slog('tests complete');
                                        phantom.exit();
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    };
})();

module.exports = load;
