'use strict';

var lodash = require('lodash');

/**
 * @param {string} tmpl
 * @param {Array} fields
 */
function sprintf (tmpl, fields) {
    lodash.each(fields, function (field) {
        tmpl = tmpl.replace('%s', field);
    });

    return tmpl;
}

/**
 * @class Code
 * @constructor
 */
function Code () {
    /**
     * @property lines
     * @type {Array}
     */
    this.lines = [];

    /**
     * available actions for this snipped of code
     * @property lines
     * @type {Object}
     */
    this.actions = {};

    // standard actions
    this.action('value', '$("%s").val("%s")');
    this.action('attr', '$("%s").attr("%s", "%s")');
    this.action('css', '$("%s").css("%s", "%s")');
}

/**
 * @method action
 * @param {string} action label of the action
 * @param {string} template code string
 * @return {Code}
 */
Code.prototype.action = function (action, template) {
    this.actions[ action ] = template;
    return this;
};

/**
 * @method add
 * @param {string} action label of the action
 * @param {Array} fields merged into action template
 * @return {Code}
 */
Code.prototype.add = function (action, fields) {
    var tmpl;

    if (!(action in this.actions)) {
        throw new Error('invalid action: ' + action);
    }

    tmpl = this.actions[ action ];
    this.lines.push(sprintf(tmpl, fields));
    return this;
};

/**
 * @method toFunction
 * @return {string}
 */
Code.prototype.toFunction = function () {
    return sprintf('function () {\n%s;\n}', [this]);
};

/**
 * @method toString
 * @return {string}
 */
Code.prototype.toString = function () {
    return this.lines.join(';\n');
};

module.exports = Code;
