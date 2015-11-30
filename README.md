# gulp-swig-compiler-renderer

# Installation
Using npm:
```
$ npm i gulp-swig-compiler-renderer --save-dev
```

# Usage
```js
var gulp = require('gulp');
var gulpSwig = require('gulp-swig-compiler-renderer');

/**
 * @typedef {{}}                GulpSwigConfig
 * @property {Function}         [swigSetup]
 * @property {SwigOpts}         [swigOptions]
 * @property {{}}               [data]
 * @property {string}           [mode='render'] 'render' or 'compile'
 * @property {string}           [compileTemplate='module.exports = <%= template %>;'] If 'mode' == 'compile', then you can define template for export tpl-function string
 */
var options = {
  swigSetup: function (swigInstance) {},
  swigOptions: {},
  data: {},
  mode: 'render', // or 'compile'
  compileTemplate: 'module.exports = <%= template %>;'
};

gulp.task('swig', function (cb) {
  return gulp.src('./src/tpls/**/*.html')
    .pipe(gulpSwig(options))
    .pipe(gulp.dest('./app'));
});

```
