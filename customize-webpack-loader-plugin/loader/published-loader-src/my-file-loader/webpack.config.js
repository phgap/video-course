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
                test: /\.png/,
                use: {
                    loader: './loader/my-file-loader.js',
                    options: {
                        name: function (path, query) {
                            console.log('========== path', path);
                            console.log('========== query', query);
                            return '20.png';
                        }
                        // name: '20.png'
                    }
                }
            }
        ]
    }
}