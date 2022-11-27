const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['./loaders/my-loader1.js', './loaders/my-loader2.js', './loaders/my-loader3.js']
            }
        ]
    }
}