const {resolve} = require('path')
const fs = require('fs')
const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const ROOT_PATH = resolve(process.cwd())
const SRC_PATH = resolve(ROOT_PATH, 'src')
const JS_PATH = resolve(SRC_PATH, 'js')
const DIST_PATH = resolve(ROOT_PATH, 'dist')

// 获取多页面每个入口文件，用于配置中的entry
function getEntry () {
    let dirs = fs.readdirSync(JS_PATH)
    let matchs = []
    let files = {}
    dirs.forEach(function(item) {
        matchs = item.match(/(.+)\.js$/)
        if (matchs) {
            files[matchs[1]] = resolve(SRC_PATH, 'js', item)
        }
    })
    console.log(dirs)
    return files
}

module.exports = {
    devtool: 'souce-map',
    entry: getEntry(),
    output: {
        path: DIST_PATH,
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js',
        publicPath: '../'
    },
    module: {
        rules: [
            {
                test: /\.(js)?$/,
                include: ROOT_PATH,
                use: [
                    'babel-loader'
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|svgz)?$/,
                include: ROOT_PATH,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: 'img/[name].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    plugins: [
        new UglifyJSPlugin({
            // compress: {
            //     warnings: false,
            //     drop_console: false
            // },
            // beautify: false,
            // comments: false,
            // extractComments: false,
            // sourceMap: false
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'BABEL_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            filename: 'js/[name].js',
            names: ['vendors']
        })
    ]
}