'use strict';

// Load plugins
var gulp         = require('gulp');
var sass         = require('gulp-sass');
var sassLint     = require('gulp-sass-lint');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var rename       = require('gulp-rename');
var concat       = require('gulp-concat');
var plumber      = require('gulp-plumber');
var gutil        = require('gulp-util');
var pug          = require('gulp-pug');
var browsersync  = require('browser-sync');
var notify       = require('gulp-notify');
var path         = require('path');




// Browser definitions for autoprefixer
var AUTOPREFIXER_BROWSERS = [
    'last 2 versions'
];




//build datestamp for cache busting
var getStamp = function() {
    var myDate = new Date();

    var myYear = myDate.getFullYear().toString();
    var myMonth = ('0' + (myDate.getMonth() + 1)).slice(-2);
    var myDay = ('0' + myDate.getDate()).slice(-2);
    var mySeconds = myDate.getSeconds().toString();

    var myFullDate = myYear + myMonth + myDay + mySeconds;

    return myFullDate;
};




// error function for plumber
var onError = function (err) {
    gutil.beep();
    console.log(err);
};




// browser-sync task for starting the server
gulp.task('browser-sync', function() {
    browsersync({
        server: {
            baseDir: "./dist/",
            proxy: "localhost:3000/index.html",
            port:3000
        },
        ghostMode: false
    });
});




// Copy bootstrap files
gulp.task('copyBoot', function(){
    return gulp.src('./src/bootstrap/**')
        .pipe(gulp.dest('./dist/bootstrap'));
});




// Copy docs files
gulp.task('copyDocs', function(){
    return gulp.src('./src/docs/**')
        .pipe(gulp.dest('./dist/docs'));
});




// copy js files
gulp.task('js', function(){
    return gulp.src('./src/theme/js/**')
        .pipe(gulp.dest('./dist/theme/js'));
});




// copy images
gulp.task('img', function(){
    return gulp.src('./src/theme/img/**')
        .pipe(gulp.dest('./dist/theme/img'));
});



gulp.task('sasslint', function () {
  return gulp.src('./src/theme/sass/**/*.s+(a|c)ss')
    .pipe(plumber({
      errorHandler: function(err) {
          notify.onError({
              title:    "SASS LINT Error:",
              message:  "<%= error.message %>",
              sound:    "Basso",
              icon:     "./error.gif"
          })(err);
          this.emit('end');
      }
    }))
    .pipe(sassLint({
         configFile: '.sass-lint.yml'
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
});



// Compile less files to /dist
gulp.task('css', ['sasslint'], function() {
    return gulp.src('./src/theme/sass/main.scss')
        .pipe(plumber({
            errorHandler: function(err) {
                notify.onError({
                    title:    "SASS Error:",
                    message:  "<%= error.message %>",
                    sound:    "Basso",
                    icon:     "./error.gif"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({ style: 'expanded', }))
        .pipe(gulp.dest('./dist/theme/css/'))
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(rename({
            basename: 'cw-theme',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/theme/css/'))
        .pipe(browsersync.stream())
        // .pipe(notify({ message: 'CSS compiled' }));
});




// Jade task compile html to jade templates to /dist
gulp.task('html', function() {
    return gulp.src('./src/pug/pages/*.pug')
        .pipe(plumber({
            errorHandler: function(err) {
                notify.onError({
                    title:    "PUG Error:",
                    message:  "<%= error.message %>",
                    sound:    "Basso",
                    icon:     "./error.gif"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(pug({
            locals: {
                'pretty': '\t'
            }
        }))
        .pipe(rename(function (path) {
            if(path.basename !== 'index'){
                var newDir = path.basename;
                path.dirname = newDir;
                path.basename = "index";
                path.extname = ".html";
            }
        }))
        .pipe(gulp.dest('./dist'));
        //.pipe(notify({ message: 'HTML compiled' }));
});




//default tasks
gulp.task('default', ['copyBoot','copyDocs', 'css','js', 'html', 'browser-sync', 'img'], function(){

    // will run task and reload browser on file change
    gulp.watch('./src/pug/**/*.pug',         ['html', browsersync.reload]);
    gulp.watch('./src/theme/sass/**/*.scss', ['css']);
    gulp.watch('./src/theme/img/*',          ['img']);
    gulp.watch('./src/docs/css/**/*.css',    ['copyDocs']);
    gulp.watch('./src/theme/js/**/*.js',     ['js', browsersync.reload]);

});
