/* globals require, module */

require("babel-polyfill");
require("whatwg-fetch");
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var WebpackStrip = require('webpack-strip');

// the path(s) that should be cleaned
var pathsToClean = [
    'dist'
];

// the clean options to use
var cleanOptions = {
    exclude: ['index.html'],
    verbose: true,
    dry: false
};

module.exports = function (environment) {
    var currDate = new Date();
    var CONFIG = {
        entry: {
            "app": ["whatwg-fetch", "babel-polyfill", './src/app.ts']
        },
        output: {
            filename: 'js/[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: "./dist/"
        },
        resolve: {
            extensions: [".ts", ".js", '.hbs', '.styl'],
            alias: {
                handlebars: 'handlebars/runtime.js'
            }
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    enforce: 'pre',
                    loader: 'tslint-loader'
                },
                {
                    test: /\.ts?$/,
                    use: ['babel-loader', 'ts-loader']
                },
                {
                    test: /\.(handlebars|hbs)$/,
                    loader: 'handlebars-loader',
                    options: {
                        ignoreHelpers: true,
                        inlineRequires: '\/images\/'
                    }
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    loader: 'file-loader',
                    options: {
                        name: "media/images/[name].[ext]"
                    }
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf|cur)$/,
                    loader: 'file-loader',
                    options: {
                        name: "fonts/[name].[ext]"
                    }
                },
                {
                    test: /\.(mp3)$/,
                    use: [
                        'file-loader?name=' + 'media/audio/[name].[ext]'
                    ]
                },
                {
                    test: /\.styl$/,
                    use: ["style-loader", "css-loader", "stylus-loader"]
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(pathsToClean, cleanOptions),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
            }),
            new webpack.DefinePlugin({
                'CACHEBUSTER': JSON.stringify(Number(currDate.getDate() + "" + (currDate.getMonth() + 1) + currDate.getFullYear() + currDate.getHours() + currDate.getMinutes())),
                'ENV': JSON.stringify(environment)
            }),
        ],
        node: {
            fs: "empty"
        }
    }

    switch (environment) {
        case 'local':
            CONFIG.output.publicPath = "/dist/";
        case 'development':
            CONFIG.devtool = "inline-source-map";
            break;
        case 'production':
            CONFIG.module.rules.push({
                test: /\.ts$/,
                loader: "webpack-strip?strip[]=console.info,strip[]=console.table,strip[]=console.log,strip[]=console.warn,strip[]=console.error"
            });
            break;
    }

    return CONFIG;
};