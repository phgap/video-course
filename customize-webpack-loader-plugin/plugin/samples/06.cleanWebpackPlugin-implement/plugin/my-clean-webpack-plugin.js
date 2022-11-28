// const { sync } = require('del');
// const del = require('del');
// require("esm")(module)
// console.log(del);

class MyCleanWebpackPlugin {
    constructor(options) {
        console.log('===== [MyCleanWebpackPlugin::constructor] =====');
        this.previousBuildAssets = [];
        this.initialClean = false;
    }

    apply(compiler) {
        console.log('===== [MyCleanWebpackPlugin::apply] =====');
        this.outputPath = compiler.options.output.path;

        compiler.hooks.emit.tapAsync("MyCleanWebpackPlugin", (compilation, cb) => {
            console.log('===== [MyCleanWebpackPlugin::apply::compiler.hooks.emit.tapAsync] =====');
            if (this.initialClean) {
                cb(null);
                return
            };

            this.initialClean = true;

            const p = this.removeFile(['**/*']);
            p.then(() => {
                cb(null);
            })
        });

        compiler.hooks.done.tapAsync("MyCleanWebpackPlugin", (stats, cb) => {
            console.log('===== [MyCleanWebpackPlugin::apply::compiler.hooks.done.tapAsync] =====');

            const assetList = Object.keys(stats.compilation.assets);
            const assetsDiff = this.previousBuildAssets.filter(previousAsset => {
                // 上次build的资源在这次build的资源中不存在
                return assetList.includes(previousAsset) === false;
            });

            // 保存当前build的资源，以备下次build时比较
            this.previousBuildAssets = assetList;
            if (assetsDiff.length > 0) {
                this.removeFile(assetsDiff);
            }

            cb(null);
        });
    }

    async removeFile(patterns) {
        console.log('===== [MyCleanWebpackPlugin::removeFile] =====');
        let deleteSync;
        try {
            ({ deleteSync } = await import("del"));
        } catch (error) {
            return;
        }


        try {
            deleteSync(patterns, {
                cwd: this.outputPath,
                dryRun: this.dry,
            })
        } catch (err) {
            console.log('===== [MyCleanWebpackPlugin::removeFile] ===== Error when delete files. error:', err);
        }
    }
}

module.exports = MyCleanWebpackPlugin;