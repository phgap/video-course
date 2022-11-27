const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.pdf$/, use: {
                    loader: './loader/pdf2pic-loader_bulk.js',
                    options: {
                        outputPath: 'assets'
                    }
                }
            }
        ]
    }
}