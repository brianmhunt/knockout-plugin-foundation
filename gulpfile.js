//
// You should never need to modify this file in the ordinary course. It may be
// modified when you merge updates from upstream.
//
// If you believe there is functionality that is missing from here, please
// submit an issue to the repository.
//
require('colors');

var fs = require('fs'),
    Q = require('q'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    yaml = require('js-yaml'),
    config = yaml.safeLoad(fs.readFileSync('./config.yaml', 'utf8')),
    proc = require('child_process'),
    pkg = require('./package.json'),
    now = new Date();

console.log(
  "\n\tKnockout Plugin Foundation task runner".yellow.underline +
    " (" + config.foundation.version + ")" +
  "\n\tPlugin: " + config.export_name.blue +
  "\n\tVersion: " + pkg.version.blue +
  "\n"
);


//      Init
//      ----
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


//    Increment version
//    -----------------
// 
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


//      CSS
//      ---
//      Convert one/many files, less, sass or stylus to css.
//      
gulp.task('css', function () {
  if (!config.css.engine) {
    return
  }
  return gulp.src(config.css.src)
    .pipe(plugins[config.css.engine](config.css.options)
    .on('error', console.log))
    .pipe(plugins.autoprefixer())
    .pipe(gulp.dest(config.css.dest))
    .pipe(plugins.connect.reload());
})


//      Server
//      ------
//      Start a webserver that livereloads on changes.
gulp.task('server', function () {
  plugins.connect.server(config.connect);
})


//      Compile Javascript
//      ------------------
//      Convert the Javascript files to one.
// 
gulp.task('compile', function () {
  gulp.src(config.script.src)
    .pipe(plugins.concat(config.export_name + ".js"))
    .pipe(plugins.header(config.header, {config: config, pkg: pkg, now: now}))
    .pipe(plugins.footer(config.footer, {config: config, pkg: pkg, now: now}))
    .pipe(gulp.dest(config.script.dest))
    .pipe(plugins.rename(config.export_name + ".min.js"))
    .pipe(plugins.uglify(config.uglify))
    .pipe(gulp.dest(config.script.dest))
    // .pipe(plugins.connect.reload());
});


//      Watch
//      -----
//      Observer changes, rebuilding as necessary.
gulp.task('watch', ['less', 'html', 'js'], function () {
  gulp.watch(config.watch.less, ['less'])
  gulp.watch(config.watch.html, ['html'])
  gulp.watch(config.watch.js, ['js'])
});


//      Self-test
//      ---------
//      Ensure the Foundation works as expected.
gulp.task('self-test', function () {
  require('./.foundation-spec')
});

//      Live
//      ----
gulp.task('live', ['watch', 'server'])

//      Menu
//      ----
gulp.task('default', function () {
    plugins.menu(this);
});

require('./tasks.js')
