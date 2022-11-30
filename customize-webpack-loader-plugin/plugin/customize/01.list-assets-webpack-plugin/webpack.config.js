const path = require('path');
const ListAssetsWebpackPlugin = require('./plugins/list-assets-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.png$/,
                use: 'file-loader'
            }
        ]
    },
    plugins: [
        new ListAssetsWebpackPlugin()
    ],
    optimization: {
        // Instruct webpack not to obfuscate the resulting code
        minimize: false,
        splitChunks: false,
    },
}