const MyCopyWebpackPlugin = require('./plugin/myCopyWebpackPlugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js'
    },
    mode: 'production',
    // mode: 'development',
    cache: false,
    // stats: 'verbose',
    plugins: [
        new MyCopyWebpackPlugin({
            patterns: [
                { from: './assets/1.txt', to: 'assets' },
                { from: './assets/2', to: 'assets' }
            ]
        })
    ]
}