class ListAssetsWebpackPlugin {
    apply(compiler) {
        console.log('========== [ListAssetsWebpackPlugin::apply] ==========');
        compiler.hooks.emit.tapAsync('ListAssetsWebpackPlugin', (compilation, cb) => {
            console.log('========== [ListAssetsWebpackPlugin::apply::compiler.hooks.emit.tapAsync] ==========', Object.keys(compilation.assets));
            const assets = Object.keys(compilation.assets).join('\n');

            const source = new compiler.webpack.sources.RawSource(assets);

            compilation.emitAsset('asset-list.md', source, {
                test: 'aaa'
            });

            cb(null);
        })
    }
}

module.exports = ListAssetsWebpackPlugin;