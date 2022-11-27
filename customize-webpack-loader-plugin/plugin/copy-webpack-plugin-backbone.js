class CopyPlugin {
    constructor(options) {
        this.options = options;
    }
    resolvePath(path) {
        // return abs path.
    }

    isDir(path) {

    }

    copyFile(path) {

    }

    copyDir(path) {

    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('CopyPlugin', (compilation) => {
            compilation.hooks.processAssets.tapAsync({
                name: "CopyPlugin",
            }, (unusedAssets, cb) => {
                this.options.patterns.forEach(pattern => {
                    const { from, to } = pattern;
                    // copy dir.

                    // copy file.
                });
                cb();
            })
        });
    }
}

module.exports = CopyPlugin;