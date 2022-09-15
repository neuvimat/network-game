// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
// const cleanPlugin = require('clean-webpack-plugin');

const preprocessor = {
    DEBUG: true,
    SERVER: true,
    CLIENT: false
};

const ifdef_query = require('querystring').encode(preprocessor);

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: `ifdef-loader?${ifdef_query}`,
                },
            }
        ]
    },
    target: 'node',
    mode: 'none',
    entry: {
        DedicatedServingServer: './src/DedicatedServingServer.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './bin')
    },
    plugins: [
        // new cleanPlugin(['public/javascripts/*']),
    ],
    resolve: {
        extensions: ['.js', '.mjs'],
        alias: {
            Client: path.resolve(__dirname, './src/client/'),
            Game: path.resolve(__dirname, 'src/game/'),
            RPC: path.resolve(__dirname, 'src/rpc/'),
            Net: path.resolve(__dirname, 'src/network/'),
            Root: path.resolve(__dirname, 'src/'),
            Util: path.resolve(__dirname, 'src/util'),
        }
    },
    node: {
        global: true,
        // Need this when working with express, otherwise the build fails
        __dirname: false,   // if you don't put this is, __dirname
        __filename: false,  // and __filename return blank or /
    },
    externals: [nodeExternals({
        whitelist: 'collisions'
    })],
    devtool: "inline-source-map",
};