/**
 * gulpfile
 * todo 时间戳.压缩html
 */

/**
 * root
 * @type {Gulp|*|exports|module.exports}
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    inject = require('gulp-inject'),
    fileinclude = require('gulp-file-include'),
    path = require('path'),
    browserSync = require('browser-sync').create();

// 开发环境目录
var DEST;

// 生产环境目录

var ROOT_PATH = path.resolve(__dirname);
var HTML_PATH = path.resolve(ROOT_PATH, 'view/*.html');

gulp.task('build', function () {
    DEST = 'build/';
});

gulp.task('html', function () {
    DEST = 'html/';
});

/**
 * javascript
 */

gulp.task('scripts', function () {
    if (DEST.indexOf('build') != -1) {
        return gulp.src([
                './src/fn/common/smartresize.js',
                './src/fn/common/common.js'
            ])
            .pipe(concat('common.js'))
            .pipe(gulp.dest(DEST + '/src/fn/common'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest(DEST + '/src/fn/common'))
            .pipe(browserSync.stream());
    }else{
        return gulp.src([
                './src/fn/common/smartresize.js',
                './src/fn/common/common.js'
            ])
            .pipe(concat('common.js'))
            .pipe(uglify())
            .pipe(gulp.dest(DEST + '/src/fn/common'))
            .pipe(browserSync.stream());
    }
});

/**
 * style
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
        .pipe(gulp.dest('./style/common/'))
        .pipe(browserSync.stream());
};

/**
 * 编译sass
 * style有以下4种选择：
 * nested：嵌套缩进，它是默认值
 * expanded：每个属性占一行
 * compact：每条样式占一行
 * compressed：整个压缩成一行
 */
gulp.task('sass', function () {
    var url = './style/common/*.scss';

    if (DEST.indexOf('build') != -1) {
        return compileSASS('custom.css', {}, url);
    }else{
        return compileSASS('custom.css', {style: 'compressed'}, url);
    }

});

/**
 * html
 * 合并html => include
 * @param srcArr
 * @returns {*}
 */
var pickHtml = function (srcArr) {
    return gulp.src(HTML_PATH)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(inject(gulp.src(srcArr, {read: false}), {relative: true}))
        .pipe(gulp.dest(DEST + '/view'));
};

gulp.task('packHtml', ['sass', 'scripts'], function () {
    var srcArr;

    if (DEST.indexOf('build') != -1) {
        srcArr = [
            './src/plugin/bootstrap/css/bootstrap.css',
            './src/plugin/font-awesome/css/font-awesome.css',
            './src/plugin/nprogress/css/nprogress.css',
            './src/plugin/animate/css/animate.css',
            './src/plugin/daterangepicker/css/daterangepicker.css',
            './src/plugin/iCheck/skins/flat/green.css',
            './style/common/custom.css',
            './src/plugin/jquery/js/jquery.js',
            './src/plugin/bootstrap/js/bootstrap.js',
            './src/plugin/moment/js/moment.min.js',
            './src/plugin/daterangepicker/js/daterangepicker.js',
            './src/plugin/iCheck/js/icheck.js',
            './src/plugin/nprogress/js/nprogress.js',
            './src/plugin/jquery.paginator/jqPaginator.min.js',
            './src/fn/common/common.js'
        ];

    } else {
        srcArr = [
            './src/plugin/bootstrap/css/bootstrap.min.css',
            './src/plugin/font-awesome/css/font-awesome.min.css',
            './src/plugin/nprogress/css/nprogress.css',
            './src/plugin/animate/css/animate.min.css',
            './src/plugin/daterangepicker/css/daterangepicker.css',
            './src/plugin/iCheck/skins/flat/green.css',
            './style/common/custom.css',
            './src/plugin/jquery/js/jquery.min.js',
            './src/plugin/bootstrap/js/bootstrap.min.js',
            './src/plugin/moment/js/moment.min.js',
            './src/plugin/daterangepicker/js/daterangepicker.js',
            './src/plugin/iCheck/js/icheck.js',
            './src/plugin/nprogress/js/nprogress.js',
            './src/plugin/jquery.paginator/jqPaginator.min.js',
            './src/fn/common/common.js'
        ];
    }

    return pickHtml(srcArr)
});

/**
 * 静态服务器
 */
gulp.task('browser-sync',['packHtml'], function () {
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
 * copy
 * 复制
 */

gulp.task('copy-plugin', function () {
    return gulp.src(['./src/plugin/**'])
        .pipe(gulp.dest(DEST + '/src/plugin'))
});

gulp.task('copy-js', function () {

    if (DEST.indexOf('build') != -1) {
        return gulp.src(['./src/fn/*.js', '!./src/fn/common/*.js'])
            .pipe(gulp.dest(DEST + '/src/fn'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest(DEST + '/src/fn'))
    }else{
        return gulp.src(['./src/fn/*.js', '!./src/fn/common/*.js'])
            .pipe(uglify())
            .pipe(gulp.dest(DEST + '/src/fn'))
    }

});

gulp.task('copy-css', ['sass'], function () {
    return gulp.src(['./style/common/*.css'])
        .pipe(gulp.dest(DEST + '/style/common'))
});

/**
 * watch
 */

gulp.task('watch', function () {
    // Watch .html files
    gulp.watch('production/*.html', browserSync.reload);
    // Watch .js files
    gulp.watch('src/js/*.js', ['scripts']);
    // Watch .scss files
    gulp.watch('src/scss/*.scss', ['sass']);
});

// Dev Task
// 开发环境
gulp.task('dev', ['build', 'copy-plugin', 'copy-js', 'copy-css','browser-sync'], function () {
    console.log('dev OK version!')
});

// Rc Task
// 生产环境
gulp.task('rc', ['html', 'copy-plugin', 'copy-js', 'copy-css', 'packHtml'], function () {
    console.log('rc OK version!')
});