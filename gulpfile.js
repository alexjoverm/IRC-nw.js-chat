var gulp = require('gulp');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
 
gulp.task('connect', function() {
  connect.server({
    root: '.',
    livereload: true
  });
});
 
gulp.task('html', function () {
  gulp.src('*.html')
     .pipe(connect.reload());
});

gulp.task('sass', function(done) {
  gulp.src('./sass/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('.'))
    .pipe(autoprefixer())
    .pipe(gulp.dest('.'))
    .pipe(rename({ extname: '.css' }))
    .pipe(gulp.dest('.'))
    .on('end', done);
});
 
gulp.task('watch', function () {
  gulp.watch(['*.html'], ['html']);
  gulp.watch(['sass/*.scss'], ['sass', 'html']);
  gulp.watch(['js/*.js'], ['html']);
});
 
gulp.task('default', ['connect', 'watch']);