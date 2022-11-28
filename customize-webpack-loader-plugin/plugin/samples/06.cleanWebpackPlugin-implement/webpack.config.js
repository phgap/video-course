const path = require('path');
const MyCleanWebpackPlugin = require('./plugin/my-clean-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    watch: true,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js'
    },
    plugins: [
        new MyCleanWebpackPlugin()
    ]
}