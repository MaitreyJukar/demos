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
    'revised-explorations/zeus_common/dist'
];

// the clean options to use
var cleanOptions = {
    exclude: ['index.html'],
    verbose: true,
    dry: false
};

var TOOL_ENTRIES = {
    "common-tools": ["whatwg-fetch", "babel-polyfill", "./src/common/helper/common-tool-loader.ts"],
    "shading-tool": ['./src/common/components/shader/src/init.ts'],
    "random-number": ['./src/common/components/random-number/src/init.ts'],
    "dnd-equal": ['./src/common/components/dnd-equal/src/init.ts'],
    "dnd-image": ['./src/common/components/dnd-image/src/init.ts'],
    "drag-drop": ['./src/common/components/drag-drop/src/init.ts'],
    "algebra-tiles": ['./src/common/components/grid/src/init.ts']
};

var TOOL_OUTPUT = {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'common-tools/dist'),
    publicPath: "./common-tools/dist/"
};

module.exports = function (environment) {
    var currDate = new Date();
    var CONFIG = {
        entry: {
            "app": ["whatwg-fetch", "babel-polyfill", './src/app.ts'],
            "k-5-app": ["whatwg-fetch", "babel-polyfill", './src/k-5-app.ts'],
            "g-6-8-app": ["whatwg-fetch", "babel-polyfill", './src/g-6-8-app.ts'],
            "helper": ['./src/common/vendor/app.js']
        },
        output: {
            filename: 'js/[name].bundle.js',
            path: path.resolve(__dirname, 'revised-explorations/zeus_common/dist'),
            publicPath: "./../zeus_common/dist/"
        },
        resolve: {
            extensions: [".ts", ".js", '.hbs', '.styl'],
            alias: {
                handlebars: 'handlebars/runtime.js'
            }
        },
        module: {
            rules: [{
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
                        precompileOptions: {
                            knownHelpersOnly: false,
                        },
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
        case 'development':
            CONFIG.output.publicPath = "/revised-explorations/zeus_common/dist/";
            CONFIG.devtool = "inline-source-map";
            break;
        case 'production':
            CONFIG.module.rules.push({
                test: /\.ts$/,
                loader: "webpack-strip?strip[]=console.info,strip[]=console.table,strip[]=console.log,strip[]=console.warn,strip[]=console.error"
            });
            break;
        case "tools":
            CONFIG.entry = TOOL_ENTRIES;
            CONFIG.output = TOOL_OUTPUT;
            CONFIG.module.rules.push({
                test: /\.ts$/,
                loader: "webpack-strip?strip[]=console.info,strip[]=console.table,strip[]=console.log,strip[]=console.warn,strip[]=console.error"
            });
            pathsToClean.pop();
            pathsToClean.push("common-tools/dist")
            break;
    }

    return CONFIG;
};