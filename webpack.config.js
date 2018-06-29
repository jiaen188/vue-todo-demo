const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

const config = {
    target: 'web',
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        filename: 'bundle.[hash:8].js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.jsx$/,
                loader: 'babel-loader'
            },
            {
                test: /\.(gif|jpg|jpeg|png|svg)$/,
                use: [
                    {
                        loader: 'url-loader', // 是对file-loader的封装
                        options: {
                            limit: 1024, // 如果图片小于1024，就转化成base64位
                            name: '[name].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }),
        new HTMLPlugin()
    ],
    // externals: {
        // 'vue': 'Vue'
    // }
}

if (isDev) {
    // 开发环境的css代码可以内联
    config.module.rules.push({
        test: /\.styl$/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true // stylus-loader会生成sourceMap，postcss-loader也会，加上这个选项表示用生成的sourceMap，提示编译效率
                }
            },
            'stylus-loader'
        ]
    })
    config.devtool = '#cheap-module-eval-source-map'
    // devServer 在webpack2.0后才有的
    config.devServer = {
        port: 8000,
        host: '127.0.0.1', // 好处： 可以在别人电脑上通过ip访问，或者手机
        overlay: { // 编译的时候出现错误，就显示到网页上
            errors: true
        },
        hot: true, // 热更新，只更新修改的页面，不会刷新整个页面
        open: true // 自动打开网页
    }
    // 热更新的相关插件
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
} else {
    // 第三方的类库，一般比较稳定，不会和业务代码一样经常变动，所以要单独打包
    config.entry = {
        app: path.join(__dirname, 'src/index.js'),
        vendor: ['vue']
    }
    // 如果是hash，那么每次打包，各个带有hash的文件，他们的hash都是相同的，
    // 这样，每次生成环境打包后，vendor也是每次都变化了，每次都会重新加载，就没有单独打包的意义了
    // 使用chunkhash的话，每个单独文件的hash都不同
    config.output.filename = '[name].[chunkhash:8].js'
    // 生产环境的css需要外联
    config.module.rules.push({
        test: /\.styl$/,
        use: ExtractPlugin.extract({
            fallback: 'style-loader',
            use: [
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true
                    }
                },
                'stylus-loader'
            ]
        })
    })
    config.plugins.push(
        new ExtractPlugin('styles.[contentHash:8].css'), // css相关插件
        new webpack.optimize.CommonsChunkPlugin({ // 第三方类库打包，单独打包到vendor.js中
            name: 'vendor'
        }),
        // FIXME: 这边还是不大明白，再看看https://www.imooc.com/video/16410
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime'
        })
    )
}

module.exports = config
