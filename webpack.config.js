let webpack = require('webpack');
let path = require('path');
let copyPlugin = require('copy-webpack-plugin')
const nodeSass = require('node-sass')

module.exports = {

    mode: 'production',

    entry: {
        aggileDistribuidora: ['./frontend/app/aggileDistribuidora/app.js'],
        aggileDistribuidoraAdmin: ['./frontend/app/aggileDistribuidoraAdmin/app.js'],
        aggileDistribuidoraReports: ['./frontend/app/aggileDistribuidoraReports/app.js'],
        aggileDistribuidoraMobile: ['./frontend/app/aggileDistribuidoraMobile/app.js'],
        vendorMobile: ['./frontend/helpers/utils-admin.js'],
        vendorSite: ['./frontend/helpers/utils-site.js'],
        vendorAdmin: ['./frontend/helpers/utils-admin.js'],
        vendorReport: ['./frontend/helpers/utils-report.js'],
        serviceWorkerSite: ['./frontend/serviceWorker/service-worker-site.js']
    },

    watch: true,

    watchOptions: {
        poll: true
    },
    resolve: {
        extensions: ['.js', '.css'],
        modules: ['./frontend', 'node_modules']

    },
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'app/public/dist'),
        libraryTarget: 'var',
        library: 'App_[name]'
    },

    plugins: [


        new webpack.LoaderOptionsPlugin({
            minimize: true,
            options: {
                resolve: {
                    extensions: ['', '.js']
                }
            }
        }),


        new copyPlugin([
            { from: 'frontend/imagens', to: path.resolve(__dirname, 'app', 'public', 'imagens') },
        ], { copyUnmodified: true }),


        new copyPlugin([
            { from: 'frontend/manifest.json', to: path.resolve(__dirname, 'app', 'public') }
        ], { copyUnmodified: true }),






        new copyPlugin([
            {
                from: 'frontend/styles',
                to: path.resolve(__dirname, 'app', 'public', 'styles', '[path][name].css'),
                transform(content, pathContent) {

                    const result = nodeSass.renderSync({ file: pathContent.toString() })

                    return result.css.toString()

                },
            }
        ])



    ],

    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: [
                    /node_modules/
                ],
                options: {
                    "sourceType": "unambiguous",
                    "babelrc": false,
                    "cacheDirectory": false,
                    "presets": [['@babel/preset-env']],
                    "plugins": [
                        '@babel/plugin-proposal-object-rest-spread',
                        ['@babel/transform-runtime', {
                            "absoluteRuntime": false,
                            "corejs": false,
                            "helpers": true,
                            "regenerator": true,
                            "useESModules": false,
                        }],
                        '@babel/plugin-proposal-class-properties',
                    ]
                }
            },

            { test: /\.s[ac]ss$/, loaders: ['style-loader', 'css-loader', 'sass-loader'], exclude: /node_modules/ },

            { test: /\.(woff|woff2|ttf|svg|eot)$/, loaders: ['url-loader'] },
        ]

    }
}