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
    fontName = "bil-icons",
    numberFontName = "bil-numbers",
    fontPrefix = "bil-icon",
    numberFontPrefix = "bil-number";

/*default gulp command*/
gulp.task("default", ["listIcon", "iconGenerate", "listNumbers", "numbersGenerate"]);

gulp.task("listIcon", function () {
    gulp.src('./font-list.html')
        .pipe(inject(
            gulp.src(['./icons-svg/*.svg'], {
                read: false
            }), {
                transform: function (filepath) {
                    if (filepath.slice(-4) === '.svg') {
                        return '<tr><td><a class="bil-icon-' + path.basename(filepath, path.extname(filepath)) + '"></a></td><td>bil-icon-' + path.basename(filepath, path.extname(filepath)) + '</td></tr>';
                    }
                    // Use the default transform as fallback:
                    return inject.transform.apply(inject.transform, arguments);
                }
            }
        ))
        .pipe(gulp.dest('./'));
});

gulp.task("iconGenerate", function () {
    gulp.src(["icons-svg/*.svg"])
        .pipe(sort({
            comparator: function (file1, file2) {
                if (file1.stat.mtime < file2.stat.mtime)
                    return 0;
                return 1;
            }
        }))
        .pipe(iconFontCss({
            cssClass: "bil-icon",
            fontName: fontName,
            path: "./../../src/common/font/templates/css-template.css",
            targetPath: "./../../../src/common/css/bil-icons.css",
            fontPath: "./../font"
        }))
        .pipe(iconFont({
            fontName: fontName,
            normalize: true,
            fontHeight: 1001,
            prependUnicode: true,
            formats: ["ttf", "eot", "woff", "woff2", "svg"]
        }))
        .pipe(gulp.dest("./../../src/common/font"));
});



gulp.task("listNumbers", function () {
    gulp.src('./number-list.html')
        .pipe(inject(
            gulp.src(['./numbers-svg/*.svg'], {
                read: false
            }), {
                transform: function (filepath) {
                    if (filepath.slice(-4) === '.svg') {
                        return '<tr><td><a class="bil-number-' + path.basename(filepath, path.extname(filepath)) + '"></a></td><td>bil-number-' + path.basename(filepath, path.extname(filepath)) + '</td></tr>';
                    }
                    // Use the default transform as fallback:
                    return inject.transform.apply(inject.transform, arguments);
                }
            }
        ))
        .pipe(gulp.dest('./'));
});

gulp.task("numbersGenerate", function () {
    gulp.src(["numbers-svg/*.svg"])
        .pipe(sort({
            comparator: function (file1, file2) {
                if (file1.stat.mtime < file2.stat.mtime)
                    return 0;
                return 1;
            }
        }))
        .pipe(iconFontCss({
            cssClass: "bil-number",
            fontName: numberFontName,
            path: "./../../src/common/font/templates/number-template.css",
            targetPath: "./../../../src/common/css/bil-numbers.css",
            fontPath: "./../font"
        }))
        .pipe(iconFont({
            fontName: numberFontName,
            normalize: true,
            fontHeight: 1001,
            prependUnicode: true,
            formats: ["ttf", "eot", "woff", "woff2", "svg"]
        }))
        .pipe(gulp.dest("./../../src/common/font"));
});