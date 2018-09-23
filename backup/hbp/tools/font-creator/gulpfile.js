//run following command to load gulp globally
//npm install -g gulp

//run following command to load local dependencies
//npm install --save-dev gulp gulp-rename gulp-iconfont gulp-iconfont-css

var gulp = require('gulp'),
    path = require('path'),
    sort = require('gulp-sort'),
    inject = require('gulp-inject'),
    iconFont = require('gulp-iconfont'),
    iconFontCss = require('gulp-iconfont-css'),
    fontName = "hbp-icons";

/*default gulp command*/
gulp.task("default", ["listIcon", "iconGenerate"]);

gulp.task("listIcon", function() {
    gulp.src('./font-list.html')
        .pipe(inject(
            gulp.src(['./icons-svg/*.svg'], { read: false }), {
                transform: function(filepath) {
                    if (filepath.slice(-4) === '.svg') {
                        return '<tr><td><a class="icon-' + path.basename(filepath, path.extname(filepath)) + '"></a></td><td>icon-' + path.basename(filepath, path.extname(filepath)) + '</td></tr>';
                    }
                    // Use the default transform as fallback:
                    return inject.transform.apply(inject.transform, arguments);
                }
            }
        ))
        .pipe(gulp.dest('./'));
});

gulp.task("iconGenerate", function() {
    gulp.src(["icons-svg/*.svg"])
        .pipe(sort({
            comparator: function(file1, file2) {
                if (file1.stat.mtime < file2.stat.mtime)
                    return 0;
                return 1;
            }
        }))
        .pipe(iconFontCss({
            fontName: fontName,
            path: "./../../source/common/font/templates/css-template.css",
            targetPath: "./../../../source/common/css/hbp-icons.css",
            fontPath: "./../font"
        }))
        .pipe(iconFont({
            fontName: fontName,
            normalize: true,
            fontHeight: 1001,
            prependUnicode: true,
            formats: ["ttf", "eot", "woff", "woff2", "svg"]
        }))
        .pipe(gulp.dest("./../../source/common/font"));
});