class HtmlWebpackPlugin {
    apply(compiler) {
        // compiler.hooks.initialize: compiler实例化完成，compilation对象还没创建
        compiler.hooks.initialize.tap('HtmlWebpackPlugin', () => {

            // compiler.hooks.thisCompilation: compilation实例化之后触发的第一个事件
            compiler.hooks.thisCompilation.tap('HtmlWebpackPlugin', (compilation) => {
                compilation.hooks.processAssets.tapAsync('HtmlWebpackPlugin', (compilationAssets, cb) => {
                    // 获取entry的assets数组
                    // 获取template全路径/templateContent
                });
            })
        });
    }
}