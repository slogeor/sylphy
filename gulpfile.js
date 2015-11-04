/**
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
 * rev: 版本号
 * revCollector: 添加版本号
 * changed: 文件改动
 * del: 删除文件
 */
var gulp = require('gulp'),
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
 * cssFile: css文件
 * cssSrcPath: src目录css文件路径
 * cssPrdPath: prd目录css文件路径
 * cssVerPath: css版本号路径
 * viewSrc: 源模版文件
 * viewPrd: 目标模版文件
 */
var sassSrc = ['/**/*.scss'],
    cssSrcPath = config.srcPath + '/styles/modules',
    cssPrdPath = config.prdPath + '/styles/modules',
    jsSrc = config.srcPath + '/scripts/**/*.js',
    jsPrd = config.prdPath + '/scripts/**/*.js',
    cssVerPath = config.verPath + '/styles/modules',
    viewSrc = config.srcPath + '/views/**/*.html',
    viewPrdPath = config.prdPath + '/views';


/**
 * Function
 */
// 改变sass文件路径
function changeSassPath() {
    var nowSassSrc = [];
    for (var i = 0, len = sassSrc.length; i < len; i++) {
        nowSassSrc.push(cssVerPath + sassSrc[i]);
    }
    return nowSassSrc;
}

//CSS里更新引入文件版本号
gulp.task('revCollectorCss', function() {
    return gulp.src([cssVerPath + '/**/*.json', cssSrcPath + '/**/*.scss'])
        .pipe(revCollector())
        .pipe(gulp.dest(cssVerPath));
});

//压缩/合并CSS/生成版本号
gulp.task('minCss', function() {
    return gulp.src(changeSassPath())
        .pipe(sass())
        .pipe(gulpif(
            config.condition, minifyCss({
                compatibility: 'ie7'
            })
        ))
        .pipe(rev())
        .pipe(gulpif(
            config.condition, changed(cssPrdPath)
        ))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false
        }))
        .pipe(gulp.dest(cssPrdPath))
        .pipe(rev.manifest())
        .pipe(gulp.dest(cssVerPath));
});


//压缩Html/更新引入文件版本
gulp.task('minHtml', function() {
    return gulp.src([cssVerPath + '/**/*.json', viewSrc])
        .pipe(revCollector())
        .pipe(gulpif(
            config.condition, minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            })
        ))
        .pipe(gulp.dest(viewPrdPath));
});

//删除次css版本号
gulp.task('delRevCss', function() {
    del([cssVerPath, cssVerPath.replace('src/', 'prd/')]);
})


//开发构建
gulp.task('dev', function (done) {
    config.condition = false;
    runSequence(
         ['revCollectorCss'],
         ['minCss'],
         ['minHtml'],
    done);
});

//prd
gulp.task('prd', function (done) {
    runSequence(
         ['revCollectorCss'],
         ['minCss'],
         ['minHtml', 'delRevCss'],
    done);
});