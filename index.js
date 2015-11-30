var es = require('event-stream');
var swig = require('swig');
var gutil = require('gulp-util');
var ext = gutil.replaceExtension;
var PluginError = gutil.PluginError;
var fs = require('fs');
var path = require('path');
var extend = require('extend');
var _ = require('lodash');


/**
 * @typedef {{}}                GulpSwigConfig
 * @property {Function}         [swigSetup]
 * @property {SwigOpts}         [swigOptions]
 * @property {string}           [mode=render] 'Render' or 'compile'
 * @property {string}           [compileTemplate] If 'mode' == 'compile', then you can define template for export tpl-function string
 */
var defaults = {
  swigSetup: function () {},
  swigOptions: {},
  mode: 'render', // or 'compile'
  compileTemplate: 'module.exports = <%= template %>;'
};

/**
 * @param {GulpSwigConfig} options
 * @returns {*}
 */
module.exports = function(options) {
  'use strict';

  options = (_.isPlainObject(options)) ? options : {};

  /** @type {SwigOpts} swigOptions */
  var swigOptions = extend({}, defaults, options.swigOptions || {});

  /** @type {Object} swigInstance */
  var swigInstance = new swig.Swig(swigOptions);

  if (_.isFunction(options.swigSetup)) {
    options.swigSetup(swigInstance);
  }

  if (_.indexOf(['render', 'compile'], options.mode) < 0) {

  }

  var gulpswig = function (file, callback) {
    var data = {};

    if (file.data) {
      data = extend({}, file.data);
    }

    try {
      var compiled = '';

      if (options.precompile) {
        var preTpl = swig.precompile(String(file.contents), {filename: file.path});
        var templateText = preTpl.tpl.toString();

        if (typeof options.precompile === "string") {
          var gutilOpts = {
            template: templateText,
            file: {
              path: file.path,
              name: path.basename(file.path),
              basename: path.basename(file.path, path.extname(file.path)),
              ext: path.extname(file.path)
            }
          };

          compiled = gutil.template(options.precompile, gutilOpts);
        } else {
          compiled = templateText;
        }
      } else {
        var tplFunc = swig.compile(String(file.contents), {filename: file.path});
        compiled = tplFunc(data);
      }

      file.contents = new Buffer(compiled);
      callback(null, file);
    } catch (err) {
      callback(new PluginError('gulp-swig', err));
      callback();
    }
  };

  return es.map(gulpswig);
};