(function() {
  'use strict';
 
  var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    browserSync = require('browser-sync'),
    _paths = ['app/**/*.js', 'public/*.*'];
 
 
  //register nodemon task
  gulp.task('nodemon', function() {
    nodemon({
      script: 'server.js',
      env: {
        'NODE_ENV': 'development'
      }
    })
      .on('restart');
  });
 
  // Rerun the task when a file changes
  gulp.task('watch', ['browser-sync'],function() {
    gulp.watch(_paths, browserSync.reload);
  });

  gulp.task('browser-sync', function(){
    browserSync.init(_paths, { proxy: "localhost:1337/"});
  });
 
  //lint js files
  gulp.task('lint', function() {
    gulp.src(_paths)
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
  });
 
 
  // The default task (called when you run `gulp` from cli)
  gulp.task('default', ['nodemon', 'watch']);
 
}());