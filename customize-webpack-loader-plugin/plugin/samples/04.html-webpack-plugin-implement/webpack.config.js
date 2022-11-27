const path = require('path');
const MyHtmlWebpackPlugin = require('./plugin/my-html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle-[contenthash].js'
    },
    plugins: [
        new MyHtmlWebpackPlugin()
    ]
}