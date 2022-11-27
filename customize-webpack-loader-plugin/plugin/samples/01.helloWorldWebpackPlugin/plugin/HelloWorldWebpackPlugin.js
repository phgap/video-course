class HelloWorldWebpackPlugin {
    apply(compiler) {
        compiler.hooks.done.tap('HelloWorldWebpackPlugin', (stats) => {
            console.log('==================[HelloWorldWebpackPlugin] compiler.hooks.done is triggered.');
        })
    }
}

module.exports = HelloWorldWebpackPlugin;