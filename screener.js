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
    debug = require('debug');

var site = process.argv[2],
    file = process.argv[3];

phantomjs.create(function (phantom) {
    phantom.createPage(function (page) {
        page.open(site, function (stat) {
            page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js', function () {
                page.evaluate(function () {
                    return $('div').text();
                }, function () {
                    console.log(arguments);
                    // page.render(file);
                    phantom.exit();
                });
            });
        });
    });
});
