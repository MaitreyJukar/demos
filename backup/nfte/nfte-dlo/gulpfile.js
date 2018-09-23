var gulp = require('gulp');
var iconFont = require('gulp-iconfont');
var iconFontCss = require('gulp-iconfont-css');
var iconFontTemplate = require('gulp-iconfont-template');
var fontName = "nfte-icons";

gulp.task("default", function(){
    gulp.src(["src/assets/icons/*.svg"])

        .pipe(iconFontCss({
            fontName: fontName,
            path: "src/templates/css-template.css",
            targetPath: "./../css/nfte-icons.css",
            fontPath: "./../font/"
        }))
        .pipe(iconFont({
            fontName: fontName,
            normalize: true,
            fontHeight: 1001,
            prependUnicode: true,
            formats: ["ttf", "eot", "woff", "woff2", "svg"]
        }))
        .pipe(gulp.dest('src/assets/font'));
});


