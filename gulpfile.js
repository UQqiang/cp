var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create();
var inject = require('gulp-inject');
var fileinclude = require('gulp-file-include');


var DEST = 'build/';

gulp.task('scripts', function () {
    return gulp.src([
            'src/js/helpers/*.js',
            'src/js/*.js',
        ])
        .pipe(concat('custom.js'))
        .pipe(gulp.dest(DEST + '/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(DEST + '/js'))
        .pipe(browserSync.stream());
});

// TODO: Maybe we can simplify how sass compile the minify and unminify version

/**
 * autoprefixer 自动处理游览器前缀
 * @param filename
 * @param options
 * @returns {*}
 */

var compileSASS = function (filename, options) {
    return sass('src/scss/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST + '/css'))
        .pipe(browserSync.stream());
};

gulp.task('sass', function () {
    return compileSASS('custom.css', {});
});

gulp.task('sass-minify', function () {
    /**
     * style有以下4种选择：
     * nested：嵌套缩进，它是默认值
     * expanded：每个属性占一行
     * compact：每条样式占一行
     * compressed：整个压缩成一行
     */
    return compileSASS('custom.min.css', {style: 'compressed'});
});

/**
 * 静态服务器
 */
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: './'
        },
        startPath: './build/view/login.html'
    }, function () {
        console.log('browser-sync.............OK')
    });
});

gulp.task('packHtml', function () {

    var srcArr = [
        './build/css/*.min.css',
        './build/js/*.min.js'
    ];

    gulp.src(['./view/*.html', '!./view/common/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(inject(gulp.src(srcArr, {
            read: false,
            relative: true
        })))
        .pipe(gulp.dest(DEST + 'view/'));
});

gulp.task('copy', function () {
    return gulp.src(['./vendors/**'])
        .pipe(gulp.dest(DEST + 'vendors/'))
});

gulp.task('watch', function () {
    // Watch .html files
    gulp.watch('production/*.html', browserSync.reload);
    // Watch .js files
    gulp.watch('src/js/*.js', ['scripts']);
    // Watch .scss files
    gulp.watch('src/scss/*.scss', ['sass', 'sass-minify']);
});

// Default Task
gulp.task('default', ['packHtml', 'browser-sync']);