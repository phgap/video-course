const vm = require('vm');

class MyHtmlWebpackPlugin {
    apply(compiler) {
        console.log('---------- [MyHtmlWebpackPlugin::apply]');
        const webpack = compiler.webpack;
        let html;
        compiler.hooks.initialize.tap('MyHtmlWebpackPlugin', (compilation) => {
            console.log('---------- [MyHtmlWebpackPlugin::compiler.hooks.initialize]');


            compiler.hooks.make.tapAsync('MyHtmlWebpackPlugin', (compilation, cb) => {
                console.log('---------- [MyHtmlWebpackPlugin::compiler.hooks.make]');
                // const webpack = compilation.compiler.webpack;
                const NodeTemplatePlugin = webpack.node.NodeTemplatePlugin;
                const NodeTargetPlugin = webpack.node.NodeTargetPlugin;
                const LoaderTargetPlugin = webpack.LoaderTargetPlugin;
                const EntryPlugin = webpack.EntryPlugin;

                const childCompiler = compilation.createChildCompiler('child-', {
                    filename: 'child--[name]',
                    // publicPath: '',
                    library: {
                        type: 'var',
                        name: 'HTML_WEBPACK_PLUGIN_RESULT'
                    },
                    scriptType: /** @type {'text/javascript'} */('text/javascript'),
                    iife: true
                }, [
                    // Compile the template to nodejs javascript
                    // new NodeTargetPlugin(),
                    // new NodeTemplatePlugin(),
                    // new LoaderTargetPlugin('node'),
                    new webpack.library.EnableLibraryPlugin('var')
                ]);

                childCompiler.context = compilation.compiler.context;

                const template = '/Users/phgapcui/线上课/04.html-webpack-plugin-implement/plugin/loader.js!/Users/phgapcui/线上课/04.html-webpack-plugin-implement/public/index.html';

                new EntryPlugin(childCompiler.context, template, 'index').apply(childCompiler);

                // Promise.resolve().then(() => {
                childCompiler.hooks.thisCompilation.tap('MyHtmlWebpackPlugin', (compilation) => {
                    console.log('---------- [MyHtmlWebpackPlugin::childCompiler.hooks.thisCompilation]');
                    compilation.hooks.processAssets.tap(
                        {
                            name: 'MyHtmlWebpackPlugin',
                            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
                        }, (assets) => {
                            console.log('---------- [MyHtmlWebpackPlugin::childCompiler.compilation.hooks.processAssets]assets:\n', assets);
                            const compilationResult = evaluateCompilationResult(assets['child--index'].source(), template);
                            html = compilationResult({});
                            compilation.deleteAeest(assets['child--index']);
                            console.log(html);
                        }
                    );
                });

                childCompiler.runAsChild((err, entries, childCompilation) => {
                    console.log('---------- [MyHtmlWebpackPlugin::childCompiler.runAsChild]');
                });
                // });
                cb();
            });

            compiler.hooks.thisCompilation.tap('MyHtmlWebpackPlugin', (compilation) => {
                console.log('---------- [MyHtmlWebpackPlugin::compiler.hooks.thisCompilation]');

                compilation.hooks.processAssets.tapAsync({
                    name: 'MyHtmlWebpackPlugin',
                    stage:
                        /**
                         * Generate the html after minification and dev tooling is done
                         */
                        webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
                }, (assets, cb) => {
                    console.log('---------- [MyHtmlWebpackPlugin::compilation.hooks.processAssets]');
                    const entryNames = Array.from(compilation.entrypoints.keys());
                    const file = compilation.entrypoints.get(entryNames[0]).getFiles();
                    const scriptTag = `<script src="${file}"></script>`;
                    let htmlContent;
                    if (html) {
                        htmlContent = html.replace(/<\/head>/, match => scriptTag + match);
                    }
                    compilation.emitAsset('index.html', new webpack.sources.RawSource(htmlContent, false));
                    cb();
                })
            });
        });
    }
}

function evaluateCompilationResult(source, filename) {
    // 取出loader和query
    const templateWithoutLoaders = filename.replace(/^.+!/, '').replace(/\?.+$/, '');

    source += ';\nHTML_WEBPACK_PLUGIN_RESULT;';
    const vmContext = vm.createContext({
        ...global,
        HTML_WEBPACK_PLUGIN: true,
        require: require,
        // htmlWebpackPluginPublicPath: publicPath,
        URL: require('url').URL,
        __filename: templateWithoutLoaders
    });
    const vmScript = new vm.Script(source, { filename: templateWithoutLoaders });

    try {
        const newSource = vmScript.runInContext(vmContext);
        console.log(newSource)
        return newSource;
    } catch (e) {
        return Promise.reject(e);
    }

}
module.exports = MyHtmlWebpackPlugin;