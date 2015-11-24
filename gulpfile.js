'use strict';
/*
 * 插件
 * gulp: gulp插件
 * sequence: 任务队列
 * gulpif: 条件判断
 * minifyHtml: html压缩
 * sass: sass编译
 * autoprefixer: 自动补全
 * minifyCSS: 压缩
 * jshint: js语法检测
 * uglify: 代码混淆
 * rename: rename
 * rev: 版本号
 * revCollector: 添加版本号
 * sourcemaps: sourceMap
 * replace:  替换
 * changed: 文件改动
 * clean: 清除文件
 */
var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    gulpif = require('gulp-if'),
    minifyHtml = require('gulp-minify-html'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    sourcemaps = require('gulp-sourcemaps'),
    replace = require('gulp-replace'),
    changed = require('gulp-changed'),
    clean = require('gulp-clean');
/**
 * 配置信息
 * projectName: 项目工程名
 * srcPath: src文件路径
 * prdPath: prd文件路径
 * verPath: md5版本信息路径
 * condition: 条件判断标志符
 */
var config = {
    'projectName': 'sylphy',
    'srcPath': './src',
    'prdPath': './prd',
    'verPath': './ver',
    'condition': true
};

/**
 * 文件路径
 * sassSrc: sass源文件
 * sassPath: sass文件路径
 * cssFile: css文件
 * cssSrcPath: src目录css文件路径
 * cssPrdPath: prd目录css文件路径
 * cssVerPath: css版本号路径
 * jsSrc: js源文件
 * jsPath: js文件路径
 * jsPrd: prd下的js文件路径
 * libSrc: lib源文件
 * libPrd: lib目的路径
 * viewSrc: 源模版文件
 * viewPrd: 目标模版文件
 */
    //modules*: hack版本号
var sassSrc = ['/pages*/**/*.scss'],
    sassPath = config.srcPath + '/styles/scss',
    cssSrcPath = config.srcPath + '/styles/css',
    cssPrdPath = config.prdPath + '/styles',
    cssVerPath = config.verPath + '/styles',

    //js
    //pages*: hack版本号
    jsSrc = ['/pages*/**/*.js'],
    jsSrcPath = config.srcPath + '/scripts',
    jsPrdPath = config.prdPath + '/scripts',
    jsVerPath = config.verPath + '/scripts',

    libSrc = config.srcPath + '/scripts/libs/**/*.js',
    libPrdPath = config.prdPath + '/scripts/libs',

    //html
    viewSrc = config.srcPath + '/views/**/*.html',
    viewPrdPath = config.prdPath + '/views',

    //ver
    verSrc = config.verPath + '/**/*.json';

//======================================
/**
 * Function
 */
//======================================

// 改变sass文件路径
function changeSassPath() {
    var nowSassSrc = [];
    for (var i = 0, len = sassSrc.length; i < len; i++) {
        nowSassSrc.push(sassPath + sassSrc[i]);
    }
    return nowSassSrc;
}

//改变js文件路径
function changeJSPath() {
    var nowJsSrc = [];
    for (var i = 0, len = jsSrc.length; i < len; i++) {
        nowJsSrc.push(jsSrcPath + jsSrc[i]);
    }
    return nowJsSrc;
}

//sass编译
function gulpSass() {
    console && console.log(changeSassPath(), cssSrcPath)
    return gulp.src(changeSassPath())
        .pipe(sass().on('error', sass.logError))
        //自动补全
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false
        }))
        // css文件
        .pipe(gulp.dest(cssSrcPath));
}

//js编译
function gulpJS() {
    return gulp.src(changeJSPath())
        .pipe(sourcemaps.init())
        .pipe(uglify().on('error', function(e) {
            console && console.log('\x07', e.lineNumber, e.message);
            return this.end();
        }))
        .pipe(sourcemaps.write('./maps'));
}
//======================================
/**
 * gulp 任务
 */

//===========更新版本号================

//CSS里更新引入文件版本号
gulp.task('revCollectorCss', function() {
    return gulp.src([cssVerPath + '/**/*.json', cssSrcPath + '/**/*.scss'])
        .pipe(revCollector());
});


gulp.task('revCollectorJS', function() {
    return gulp.src([jsVerPath + '/**/*.json', jsSrcPath + '/**/*.js'])
        .pipe(revCollector());
});

//==========sass============

//压缩/合并CSS/生成版本号
gulp.task('minDevCSS', function() {
    gulpSass()
        // 版本号
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest(cssVerPath));
});

//压缩/合并CSS/生成版本号
gulp.task('minPrdCSS', function() {
    gulpSass()
        // 压缩
        .pipe(minifyCss({
            compatibility: 'ie7'
        }))
        // 版本号
        .pipe(rev())
        // 正式环境
        .pipe(changed(cssPrdPath))
        // 正式css文件
        .pipe(gulp.dest(cssPrdPath))
        // 版本号map
        .pipe(rev.manifest())
        .pipe(gulp.dest(cssVerPath));
});

//=============js============

// 压缩混淆JS 
gulp.task('minPrdJS', function() {
    gulpJS()
        .pipe(rev())
        // 正式环境
        .pipe(changed(jsPrdPath))
        // 正式文件
        .pipe(gulp.dest(jsPrdPath))
        // 版本号map
        .pipe(rev.manifest())
        .pipe(gulp.dest(jsVerPath));
});

//libs
gulp.task('minLibJS', function() {
    return gulp.src(libSrc)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify().on('error', function(e) {
           console && console.log('\x07', e.lineNumber, e.message);
            return this.end();
        }))
        .pipe(changed(libPrdPath))
        // 正式文件
        .pipe(gulp.dest(libPrdPath));
});

//==========html============

//压缩Html/更新引入文件版本

gulp.task('minHtml', function() {
    return gulp.src([verSrc, viewSrc])
        .pipe(revCollector())
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(replace('/src/', '/prd/'))
        .pipe(replace('/css/', '/'))
        .pipe(gulp.dest(viewPrdPath));
});

//清除文件
gulp.task('clean', function() {
    return gulp.src([cssPrdPath, jsPrdPath], {
            read: false
        })
        .pipe(clean());

});

//============watch=========

// 监听文件
gulp.task('watch', function() {
    console && console.log(changeSassPath())
    // scss文件
    gulp.watch(changeSassPath(), ['minDevCSS']);

    // js文件
    gulp.watch(changeJSPath(), ['minPrdJS']);

    // // 看守所有图片档
    // gulp.watch('src/images/**/*', ['images']);

    // // 建立即时重整伺服器
    // var server = livereload();

    // // 看守所有位在 dist/  目录下的档案，一旦有更动，便进行重整
    // gulp.watch(['dist/**']).on('change', function(file) {
    //   server.changed(file.path);
    // });

});

//开发环境
gulp.task('dev', function(done) {
    runSequence(
        ['revCollectorCss'], ['minDevCSS'],
        done);
});

//prd
gulp.task('prd', function(done) {
    runSequence(
        ['clean'], ['revCollectorCss', 'revCollectorJS'], ['minPrdJS', 'minPrdCSS', 'minHtml'],
        done);
});

//default

gulp.task('default', function() {
    runSequence('watch');
});

//TODO 
//1、删除css改变