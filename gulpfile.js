var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    inject = require('gulp-inject'),
    fileinclude = require('gulp-file-include'),
    browserSync = require('browser-sync').create();

// 开发环境目录
var DEST = 'build/';

// 生产环境目录
var HTML = 'html/';

/**
 * js 公共部分
 */

gulp.task('scripts', function () {
    return gulp.src([
            'src/js/helpers/*.js',
            'src/js/common/common.js'
        ])
        .pipe(concat('common.js'))
        .pipe(gulp.dest(DEST + '/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(DEST + '/js'))
        .pipe(browserSync.stream());
});

// TODO: Maybe we can simplify how sass compile the minify and unminify version

/**
 * sass,scss
 * autoprefixer 自动处理游览器前缀
 * @param filename
 * @param options
 * @returns {*}
 */

var compileSASS = function (filename, options, url) {
    return sass(url, options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST + '/css/common/'))
        .pipe(browserSync.stream());
};

/**
 * 合并html => include
 * @param srcArr
 * @returns {*}
 */
var pickHtml = function (srcArr) {
    return gulp.src(['./view/*.html', '!./view/common/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(inject(gulp.src(srcArr)))
        .pipe(gulp.dest(DEST + '/view'));
};

/**
 * 编译sass
 */
gulp.task('sass', function () {
    var url = 'style/common/*.scss';
    return compileSASS('custom.css', {} ,url);
});

/**
 * 编辑并压缩sass
 */

gulp.task('sass-minify', function () {
    var url = 'style/common/*.scss';
    /**
     * style有以下4种选择：
     * nested：嵌套缩进，它是默认值
     * expanded：每个属性占一行
     * compact：每条样式占一行
     * compressed：整个压缩成一行
     */
    return compileSASS('custom.min.css', {style: 'compressed'}, url);
});

/**
 * 静态服务器
 */
gulp.task('browser-sync', ['packHtml'], function () {
    return browserSync.init({
        server: {
            baseDir: './'
        },
        startPath: './build/view/login.html'
    }, function () {
        console.log('browser-sync.............OK')
    });
});

/**
 * 复制
 */

gulp.task('copy', function () {
    return gulp.src(['./src/plugin/**'])
        .pipe(gulp.dest(DEST + '/js/plugin'))
});

gulp.task('packHtml', ['sass', 'sass-minify', 'scripts'], function () {

    var srcArr = [
        './build/css/*.min.css',
        './build/js/*.min.js'
    ];
    return pickHtml(srcArr)
});

gulp.task('packHtml-dev', ['sass', 'sass-minify', 'scripts'], function () {

    var srcArr = [
        './build/js/plugin/bootstrap/css/bootstrap.css',
        './build/js/plugin/font-awesome/css/font-awesome.css',
        './build/js/plugin/nprogress/css/nprogress.css',
        './build/js/plugin/animate/css/animate.css',
        './build/js/plugin/daterangepicker/css/daterangepicker.css',
        './build/js/plugin/iCheck/skins/flat/green.css',
        './build/css/common/custom.css',
        './build/js/plugin/jquery/js/jquery.js',
        './build/js/plugin/bootstrap/js/bootstrap.js',
        './build/js/plugin/moment/js/moment.min.js',
        './build/js/plugin/daterangepicker/js/daterangepicker.js',
        './build/js/plugin/iCheck/js/icheck.js',
        './build/js/plugin/nprogress/js/nprogress.js',
        './build/js/plugin/jquery.paginator/jqPaginator.min.js',
        './build/js/common.js'
    ];
    return pickHtml(srcArr)
});

gulp.task('watch', function () {
    // Watch .html files
    gulp.watch('production/*.html', browserSync.reload);
    // Watch .js files
    gulp.watch('src/js/*.js', ['scripts']);
    // Watch .scss files
    gulp.watch('src/scss/*.scss', ['sass', 'sass-minify']);
});

// Dev Task
// 开发环境
gulp.task('default', ['sass', 'sass-minify', 'scripts', 'copy', 'packHtml-dev', 'browser-sync','watch']);
gulp.task('dev', ['sass', 'sass-minify', 'scripts', 'packHtml-dev', 'browser-sync']);

// Rc Task
// 生产环境
gulp.task('rc', ['sass', 'sass-minify', 'scripts', 'packHtml', 'browser-sync']);