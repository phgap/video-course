const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Tukoh taka',
            customizedValue: '2022世界杯主题曲',
            template: './public/index.html'
        })
    ]
}