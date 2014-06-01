'use strict';

var lodash = require('lodash');

function sprintf (tmpl, fields) {
    lodash.each(fields, function (field) {
        tmpl = tmpl.replace('%s', field);
    });

    return tmpl;
}

function Code () {
    this.lines = [];
    this.actions = {};

    // standard actions
    this.action('value', '$("%s").val("%s")');
    this.action('attr', '$("%s").attr("%s", "%s")');
    this.action('css', '$("%s").css("%s", "%s")');
}

Code.prototype.action = function (action, template) {
    this.actions[ action ] = template;
};

Code.prototype.add = function (action, fields) {
    var tmpl;

    if (!(action in this.actions)) {
        throw new Error('invalid action: ' + action);
    }

    tmpl = this.actions[ action ];
    this.lines.push(sprintf(tmpl, fields));
};

Code.prototype.toString = function () {
    return 'function () { ' + this.lines.join(';\n') + '}';
};

module.exports = Code;
