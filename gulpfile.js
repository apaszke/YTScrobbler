var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var del = require('del');

var paths = {
  scripts: [
    './src/js/*.js'
  ],
  modules: [
    './src/js/modules/*.js',
    './src/js/modules/bg/*.js'
  ],
  static: [
    './src/css/*',
    './src/img/*',
    './src/fonts/*',
    './src/manifest.json',
    './src/popup.html'
  ]
};

gulp.task('default', ['move', 'browserify']);

gulp.task('browserify', function () {
  var browserified = transform(function (filename) {
    var b = browserify(filename);
    return b.bundle();
  });

  return gulp.src(paths.scripts)
    .pipe(browserified)
    .pipe(gulp.dest('./build/js'));
});

gulp.task('clean', function (cb) {
  del(['./build/*'], cb);
});

gulp.task('move', function () {
  gulp.src(paths.static, { base: './src/' })
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function () {
  gulp.watch(paths.scripts.concat(paths.modules), ['browserify']);
  gulp.watch(paths.static, ['move']);
});