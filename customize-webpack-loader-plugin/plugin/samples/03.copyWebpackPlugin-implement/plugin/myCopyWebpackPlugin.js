const path = require('path');
const normalizePath = require("normalize-path");
const fastGlob = require("fast-glob");

class MyCopyWebpackPlugin {
    constructor(options) {
        this.options = options;
        this.compiler = null;
    }

    resolvePath(relativePath) {
        if (this.compiler === null) throw new Errlr('[MyCopyWebpackPlugin::resolvePath] should be called after calling apply()');
        // return abs path.
        return path.resolve(this.compiler.options.context, relativePath);
    }

    isDir(path) {
        console.log('========== [MyCopyWebpackPlugin::isDir]');
        if (this.compiler === null) throw new Errlr('[MyCopyWebpackPlugin::isDir] should be called after calling apply()');
        const { inputFileSystem: { stat } } = this.compiler;
        return new Promise((resolve, reject) => {
            stat(path, (err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (stats.isDirectory()) {
                    resolve(true);
                } else if (stats.isFile()) {
                    resolve(false);
                } else {
                    reject(err);
                }

            })
        })
    }

    async copyDir(compilation, from, to) {
        console.log('========== [MyCopyWebpackPlugin::copyDir]');
        const { inputFileSystem, options: { context } } = this.compiler;
        let globby
        try {
            ({ globby } = await import("globby"));
        } catch (error) {
            return;
        }

        const glob = path.posix.join(
            fastGlob.escapePath(normalizePath(path.resolve(from))),
            "**/*"
        );

        let globEntries = await globby(glob, {
            objectMode: true
        });

        // console.log('========== [MyCopyWebpackPlugin::copyDir] globEntries', globEntries);

        await Promise.all(
            globEntries.map(async (globEntry) => {
                let pathTo = path.relative(from, globEntry.path);
                pathTo = path.join(to, pathTo);
                await this.copyFile(compilation, globEntry.path, pathTo);
            })
        )
    }

    copyFile(compilation, from, to) {
        console.log('========== [MyCopyWebpackPlugin::copyFile]');
        const { inputFileSystem: { readFile } } = this.compiler;
        const { RawSource } = this.compiler.webpack.sources;
        return new Promise((resolve, reject) => {
            readFile(from, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                const source = new RawSource(data);

                compilation.emitAsset(to, source);

                resolve();
            })
        })
    }

    apply(compiler) {
        // console.log(compiler.options);
        this.compiler = compiler;
        compiler.hooks.thisCompilation.tap("MyCopyWebpackPlugin", (compilation) => {
            // NO_STAGE
            compilation.hooks.processAssets.tapAsync({
                name: "MyCopyWebpackPlugin",
            }, (unusedAssets, cb) => {
                // console.log('========== [processAssets::NO_STAGE]');
                this.options.patterns.forEach(async (pattern) => {
                    const { from, to } = pattern;
                    // console.log(`========== from: ${from}, to: ${to}`)
                    const absFrom = this.resolvePath(from);
                    // console.log(`========== absFrom: ${absFrom}`)
                    // console.log(`========== absTo: ${absTo}`)
                    const isDir = await this.isDir(absFrom);
                    if (isDir) {
                        // copy dir.
                        this.copyDir(compilation, absFrom, to);
                    } else {
                        // copy file.
                        const pathTo = path.join(to, path.basename(absFrom));
                        await this.copyFile(compilation, absFrom, pathTo);
                    }

                });
                cb();
            });
        });

    }
}

module.exports = MyCopyWebpackPlugin;