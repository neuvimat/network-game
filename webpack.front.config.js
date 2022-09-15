// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const path = require('path');
// const cleanPlugin = require('clean-webpack-plugin');

const preprocessor = {
    DEBUG: true,
    SERVER: false,
    CLIENT: true
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
    entry: {
        Client:                     './src/Client.js',
        Editor:                     './src/Editor.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist/js/')
    },
    plugins: [
        // new cleanPlugin(['public/javascripts/*']),
    ],
    resolve: {
        alias: {
            Client: path.resolve(__dirname, './src/client/'),
            Game: path.resolve(__dirname, 'src/game/'),
            RPC: path.resolve(__dirname, 'src/rpc/'),
            Net: path.resolve(__dirname, 'src/network/'),
            Root: path.resolve(__dirname, 'src/'),
            Util: path.resolve(__dirname, 'src/util'),
        }
    },
    mode: 'development',
    devtool: "inline-source-map",
};