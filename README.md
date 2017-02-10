# 管控平台

## 项目目录结构

```
|- src/ ---------------------------------- js 和 插件 的目录
    |- fn -------------------------------- js 的目录
       |- common ------------------------- 通用的 js
       |- *.js --------------------------- 业务相关的 js
    |- plugin ---------------------------- 插件 的目录(存放插件对应的脚本和样式)
|- style --------------------------------- 样式 的目录
    |- common ---------------------------- 通用的 scss 的样式
    |- scss ------------------------------ scss 的样式
|- view ---------------------------------- html 的文件夹
    |- common ---------------------------- html 模板
    |- *.html ---------------------------- 业务相关的 html
```

## gulpfile config 说明

## 使用

```
1. git clone <当前项目>

2. npm install / sudo npm install / cnpm install

3. 开发环境 - gulp dev

4. 生产环境 - gulp rc

// 存在 gem sass is not installed 的问题
// 解决办法:
$ sudo gem install sass

// 如果安装不成功,gem使用淘宝镜像
$ gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
$ gem sources -l
$ sudo gem install sass

```

## gulp-concat - 连接文件

## gulp-uglify - 压缩 js

## gulp-rename - 重命名

## gulp-inject - 注入公共部分的js和css

## gulp-fileinclude - 引入公共部分的html

## gulp-clean - 清除文件

## gulp-htmlmin - 压缩html

## path - node 的 path模块

## browserSync - 启动服务

## gulp-autoprefixer - 自动处理游览器前缀

#### 基本使用

```
var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('testAutoFx', function () {
    gulp.src('src/css/index.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('dist/css'));
});
```

#### 参数说明

```
● last 2 versions: 主流浏览器的最新两个版本
● last 1 Chrome versions: 谷歌浏览器的最新版本
● last 2 Explorer versions: IE的最新两个版本
● last 3 Safari versions: 苹果浏览器最新三个版本
● Firefox >= 20: 火狐浏览器的版本大于或等于20
● iOS 7: IOS7版本
● Firefox ESR: 最新ESR版本的火狐
● > 5%: 全球统计有超过5%的使用率
```

## gulp-ruby-sass 编译scss

#### 基本使用

```
var compileSASS = function (filename, options) {
  return sass('src/scss/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST+'/css'))
        .pipe(browserSync.stream());
};

gulp.task('sass-minify', function() {
    /**
     * style有以下4种选择：
     * nested：嵌套缩进，它是默认值
     * expanded：每个属性占一行
     * compact：每条样式占一行
     * compressed：整个压缩成一行
     */
    return compileSASS('custom.min.css', {style: 'compressed'});
});
```

#### 参数说明

```
 * style有以下4种选择：
     ● nested：嵌套缩进，它是默认值
     ● expanded：每个属性占一行
     ● compact：每条样式占一行
     ● compressed：整个压缩成一行
```