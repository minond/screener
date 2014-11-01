'use strict';

var Configuration = require('acm').Configuration,
    config = new Configuration({ project_root: __dirname });

var program = require('commander')
    .option('-c, --configuration <file>', 'configuration file', 'tests/snapshots/config.yml')
    .version(require('./package.json').version);

program
    .command('fetch')
    .description('updates reference images')
    .action(function () {
        console.log(program.configuration);
    });

program.parse(process.argv);

if (program.configuration) {
    config.$file_links.base = program.configuration;
}

if (!program.args.length) {
    program.help();
}
