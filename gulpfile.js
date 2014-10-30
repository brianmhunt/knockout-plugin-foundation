//
// You should never need to modify this file in the ordinary course. It may be
// modified when you merge updates from upstream.
//
// If you believe there is functionality that is missing from here, please
// submit an issue to the repository.
//
var fs = require('fs'),
    Q = require('q'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    yaml = require('js-yaml'),
    config = yaml.safeLoad(fs.readFileSync('./config.yaml', 'utf8')),
    proc = require('child_process'),
    pkg = require('./package.json');


// init
// ----
// Perform the things necessary to get rolling.
gulp.task("init", function () {
  var css;

  if (config.css.engine) {
    css = Q.Promise(function (resolve, reject) {
      plugins.util.log("Installing", config.css.engine)
      proc.spawn("npm", ['install', "gulp-" + config.css.engine], {stdio: 'inherit'})
        .on('close', resolve)
        .on('error', reject)
    })
  }

  return Q.all([css])
});



// from https://github.com/ikari-pl/gulp-tag-version
function inc(importance) {
  console.log(" ----  >>>  Don't forget: $ git push --tag");
  return gulp.src(['./package.json', './bower.json'])
    .pipe(plugins.bump({type: importance}))
    .pipe(gulp.dest('./'))
    .pipe(plugins.git.commit('bumps package version'))
    .pipe(plugins.filter('bower.json'))
    .pipe(plugins.tagVersion())
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })


gulp.task('css', function () {
  if (!config.css.engine) {
    return
  }
  return gulp.src(config.css.src)
    .pipe(plugins[config.css.engine](config.css.options)
    .on('error', console.log))
    .pipe(plugins.autoprefixer())
    .pipe(gulp.dest(config.css.dst))
    .pipe(plugins.connect.reload());
})

gulp.task('connect', function () {
  plugins.connect.server(config.connect);
})

gulp.task('html', function () {
  gulp.src(config.watch.html)
    .pipe(plugins.connect.reload());
});

gulp.task('js', function () {
  gulp.src(config.watch.js)
    .pipe(plugins.connect.reload());
});

gulp.task('watch', ['less', 'html', 'js'], function () {
  gulp.watch(config.watch.less, ['less'])
  gulp.watch(config.watch.html, ['html'])
  gulp.watch(config.watch.js, ['js'])
})

gulp.task('live', ['watch', 'connect'])
gulp.task('default', ['live'])
