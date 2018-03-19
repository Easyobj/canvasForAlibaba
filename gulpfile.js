const gulp = require('gulp')
const clean = require('gulp-clean')
const runSequence = require('run-sequence')
const gulpWebpack = require('gulp-webpack')
const webpack = require('webpack')
const htmlmin = require('gulp-htmlmin')
const ejs = require('gulp-ejs')
const connect = require('gulp-connect')
const proxy = require('http-proxy-middleware')
const rev = require('gulp-rev')
const revColletor = require('gulp-rev-collector')
const cleanCss = require('gulp-clean-css')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const gutil = require('gulp-util')

const webpackCfg = require('./webpack.config.js')

/**
 * 清除dist/rev/build
 */
// 清除dist目录
gulp.task('cleanDist', () => {
    return gulp.src('dist', {read: false})
        .pipe(clean({force: true}))
})

//清除build\rev目录
gulp.task('cleanBuildRev', () => {
    return gulp.src(['build', 'rev'], {read: false})
        .pipe(clean({force: true}))
})

/**
 * 处理js
 */
// 引用webpack对js进行处理
gulp.task('buildJs', () => {
    return gulp.src('src/js/*.js')
        .pipe(gulpWebpack(webpackCfg, webpack))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload())
})

// 添加js的hash值
gulp.task('hashJs',['buildJs'], () => {
    return gulp.src(['dist/js/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('build/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'))
})

/**
 *  处理css
 */
// sass 处理css
gulp.task('sass',() => {
    return gulp.src('src/css/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist/css'))
        .pipe(connect.reload())
})
// postcss 处理css
gulp.task('postcss',['sass'],() => {
    const plugins = [
        autoprefixer({browsers: ['last 2 versions', 'ie >= 8', '> 5% in CN']})
    ]
    return gulp.src('dist/css/*.css')
        .pipe(postcss(plugins))
        .pipe(gulp.dest('dist/css'))
        .pipe(connect.reload())
})
// 压缩css并添加hash值
gulp.task('minifyCss', ['sass', 'postcss'], () => {
    return gulp.src('dist/css/*.css')
        .pipe(rev())
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('build/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'))
})

/**
 * 处理html
 */
// 处理ejs模版
gulp.task('ejsInclude',() => {
    return gulp.src('src/html/*.ejs')
        .pipe(ejs({}, {}, {ext: '.html'})).on('error', gutil.log)
        .pipe(gulp.dest('dist/html'))
        .pipe(connect.reload())
})

// 压缩html
gulp.task('htmlmin',['ejsInclude'],() => {
    const options = {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
    }
    return gulp.src('dist/html/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('build/html'))
})

/**
 * 替换hash文件及路径
 */
const publicPath = '..'
// 替换html文件中的hash js
gulp.task('revHtmlJs',['htmlmin'],() => {
    return gulp.src(['rev/js/*.json', 'build/html/*.html'])
        .pipe(revColletor({
            replaceReved: true,
            dirReplacements: {
                '../../js': publicPath + '/js',
                '../js': publicPath + '/js'
            }
        }))
        .pipe(gulp.dest('build/html'))
})

// 替换html文件中的hash css
gulp.task('revHtmlCss',() => {
    return gulp.src(['rev/css/*.json', 'build/html/*.html'])
        .pipe(revColletor({
            replaceReved: true,
            dirReplacements: {
                '../../css': publicPath + '/css',
                '../css': publicPath + '/css'
            }
        }))
        .pipe(gulp.dest('build/html'))
})

/**
 * 开启服务和监控
 */
gulp.task('connect', () => {
    connect.server({
        root: ['dist'],
        port: 8038,
        livereload: true,
        middleware: (connect, opt) => {
            return [
                proxy('/api', {
                    target: 'http://www.baidu.com',
                    changeOrigin: true
                })
            ]
        }
    })
})

gulp.task('watch', () => {
    gulp.watch(['src/html/*.ejs', 'src/html/*/*.ejs'],['ejsInclude'])
    gulp.watch(['src/js/*.js', 'src/js/*/*.js'], ['buildJs'])
})

/**
 * 开发与打包
 */
//pc端
gulp.task('devPc', (callback) => runSequence(
    'cleanDist',
    ['sass','ejsInclude','buildJs'],
    ['postcss'],
    ['watch','connect'],
    callback
))

gulp.task('buildPc', (callback) => runSequence(
    'cleanBuildRev',
    ['sass','ejsInclude','buildJs'],
    ['postcss', 'hashJs', 'htmlmin'],
    'minifyCss',
    'revHtmlCss',
    'revHtmlJs',
    callback
))