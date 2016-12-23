"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var server = require("browser-sync");
var run = require("run-sequence");
var rename = require("gulp-rename");
var minify = require("gulp-csso");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var imagemin = require("gulp-imagemin");
var del = require("del");
var ghPages = require('gulp-gh-pages');
var uglify = require('gulp-uglify');
var pump = require('pump');

gulp.task("build", function(fn){
     run(
       "clean",
       "copy",
       "style",
       "images",
       "jsmin",
       "symbols",
       fn);
 });

gulp.task("clean", function() {
 return del("build");
});

gulp.task('send', function() {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});

gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html",
    "*.php"
  ], {
  base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task('jsmin', function (cb) {
  pump([
        gulp.src('js/*.js'),
        uglify(),
        gulp.dest('build/js')
    ],
    cb
  );
});

gulp.task("style", function() {
  gulp.src("less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 15 versions"
      ]}),
      mqpacker({
        sort:true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
});

gulp.task("markup", function() {
  gulp.src("*.html")
    .pipe(gulp.dest("build/"))
});
gulp.task("js", function() {
  gulp.src("js/*.js")
    .pipe(gulp.dest("build/js/"))
});
gulp.task("img", function() {
  gulp.src("img/**")
    .pipe(gulp.dest("build/img/"))
});

gulp.task("images", function() {
     return gulp.src("build/img/**/*.{png,jpg,gif}")
     .pipe(imagemin([
     imagemin.optipng({optimizationLevel: 3}),
     imagemin.jpegtran({progressive: true})
     ]))
     .pipe(gulp.dest("build/img"));
   });

 gulp.task("symbols", function() {
   return gulp.src("build/img/icons/*.svg")
   .pipe(svgmin())
   .pipe(svgstore({
      inlineSvg: true
     }))
   .pipe(rename("symbols.svg"))
   .pipe(gulp.dest("build/img"));
 });

gulp.task("default",function() {
  server.init({
    server: "build",
  });
  gulp.watch("less/**/*.less", ["style"]).on("change", server.reload);
  gulp.watch("*.html",["markup"]).on("change", server.reload);
  gulp.watch("js/*.js",["js"]).on("change", server.reload);
  gulp.watch("img/**",["img"]).on("change", server.reload);
});

