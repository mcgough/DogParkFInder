var gulp = require("gulp"),
  less = require("gulp-less"),
  concat = require("gulp-concat");

gulp.task("less", function() {
  return gulp
    .src("./public/less/*.less")
    .pipe(less())
    .pipe(concat("style.css"))
    .pipe(gulp.dest("./public/css/"));
});

gulp.task("watch", function() {
  gulp.watch("./public/less/*.less", ["less"]);
});

gulp.task("default", ["less"]);
