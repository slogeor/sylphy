/*
 * 插件
 * gulp: gulp插件
 * webserver: web服务
 * sequence: 任务队列
 * gulpif: 条件判断
 * minifyHtml: html压缩
 * sass: sass编译
 * autoprefixer: 自动补全
 * minifyCSS: 压缩
 * jshint: js语法检测
 * uglify: 代码混淆
 * rev: 版本号
 * revCollector: 添加版本号
 * replace:  替换
 * changed: 文件改动
 * del: 删除文件
 */
var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    runSequence = require('run-sequence'),
    gulpif = require('gulp-if'),
    minifyHtml = require('gulp-minify-html'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    replace = require('gulp-replace'),
    changed = require('gulp-changed'),
    del = require('del');

// csslint = require('gulp-csslint'),
// stylish = require('jshint-stylish'),

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
 * viewSrc: 源模版文件
 * viewPrd: 目标模版文件
 */
var sassSrc = ['/**/*.scss'],
    sassPath = config.srcPath + '/styles/scss/modules',
    cssSrcPath = config.srcPath + '/styles/css/modules',
    cssPrdPath = config.prdPath + '/styles/modules',
    jsSrc = config.srcPath + '/scripts/**/*.js',
    jsPrd = config.prdPath + '/scripts/**/*.js',
    cssVerPath = config.verPath + '/styles/modules',
    viewSrc = config.srcPath + '/views/**/*.html',
    viewPrdPath = config.prdPath + '/views';


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
    console.log(nowSassSrc)
    return nowSassSrc;
}

//======================================
/**
 * gulp 任务
 */
//======================================

//CSS里更新引入文件版本号
gulp.task('revCollectorCss', function() {
    return gulp.src([cssVerPath + '/**/*.json', cssSrcPath + '/**/*.scss'])
        .pipe(revCollector());
});

//压缩/合并CSS/生成版本号
gulp.task('minDevCss', function() {
    console.log(changeSassPath(), cssSrcPath)
    return gulp.src(changeSassPath())
        .pipe(sass())
        //自动补全
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false
        }))
        // css文件
        .pipe(gulp.dest(cssSrcPath))
        // 版本号
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest(cssVerPath));
});

//压缩/合并CSS/生成版本号
gulp.task('minPrdCss', function() {
    return gulp.src(changeSassPath())
        .pipe(sass())
        //自动补全
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false
        }))
        // css文件
        .pipe(gulp.dest(cssSrcPath))
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

//压缩Html/更新引入文件版本
gulp.task('minHtml', function() {
    return gulp.src([cssVerPath + '/**/*.json', viewSrc])
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

//删除css版本号
gulp.task('delRevCss', function() {
    del(cssVerPath);
})

// 删除css文件
gulp.task('delPrdCss', function() {
    del(cssPrdPath);
})

// 监听文件
gulp.task('watch', function() {
    // scss文件
    gulp.watch(changeSassPath(), ['minDevCss']);

    // // 看守所有.js档
    // gulp.watch('src/scripts/**/*.js', ['scripts']);

    // // 看守所有图片档
    // gulp.watch('src/images/**/*', ['images']);

    // // 建立即时重整伺服器
    // var server = livereload();

    // // 看守所有位在 dist/  目录下的档案，一旦有更动，便进行重整
    // gulp.watch(['dist/**']).on('change', function(file) {
    //   server.changed(file.path);
    // });

});


//webserver
// gulp.task('webserver', function() {
//     gulp.src('./sylphy')
//         .pipe(webserver({
//             livereload: true,
//             directoryListing: {
//                 enable: true,
//                 path: 'sylphy'
//             },
//             host: '127.0.0.1',
//             port: 8000
//         }));
// });


//开发环境
gulp.task('dev', function(done) {
    runSequence(
        ['revCollectorCss'], ['minDevCss'],
        done);
});

//prd
gulp.task('prd', function(done) {
    runSequence(
        ['delPrdCss', 'delRevCss'], 
        ['revCollectorCss'], 
        ['minPrdCss'], ['minHtml'],
        done);
});


//TODO 
//1、删除css改变
//2、webserver