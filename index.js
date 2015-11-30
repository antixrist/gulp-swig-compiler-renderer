var es = require('event-stream');
var swig = require('swig');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var extend = require('extend');
var _ = require('lodash');

/**
 * @typedef {{}}                GulpSwigConfig
 * @property {Function}         [swigSetup]
 * @property {SwigOpts}         [swigOptions]
 * @property {{}}               [data]
 * @property {string}           [mode='render'] 'render' or 'compile'
 * @property {string}           [compileTemplate='module.exports = <%= template %>;'] If 'mode' == 'compile', then you can define template for export tpl-function string
 */
var defaults = {
  swigSetup: function () {},
  swigOptions: {},
  data: {},
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
  var swigOptions = extend(true, {}, defaults, options.swigOptions || {});

  /** @type {Object} swigInstance */
  var swigInstance = new swig.Swig(swigOptions);

  if (_.isFunction(options.swigSetup)) {
    options.swigSetup(swigInstance);
  }

  var data = {};

  if (_.isPlainObject(options.data)) {
    data = options.data;
  }

  var gulpSwig = function (file, callback) {

    if (_.isPlainObject(file.data)) {
      data = extend(true, {}, data, file.data);
    }

    try {
      var result = '',
          tplFunc = swigInstance.compile(String(file.contents), {filename: file.path}),
          tplFuncString = tplFunc.toString();

      if (options.mode != 'compile') {
        // render
        result = tplFunc(data);
      } else {
        // compile
        if (_.isString(options.compileTemplate) && options.compileTemplate) {
          var compileTemplateOpts = {
            template: tplFuncString,
            file: {
              path: file.path,
              name: path.basename(file.path),
              basename: path.basename(file.path, path.extname(file.path)),
              ext: path.extname(file.path)
            }
          };

          result = gutil.template(options.compileTemplate, compileTemplateOpts);
        } else {
          result = tplFuncString;
        }
      }

      file.contents = new Buffer(result);
      callback(null, file);

    } catch (err) {
      callback(new PluginError('gulp-swig', err));
      callback();
    }
  };

  return es.map(gulpSwig);
};