const path = require('path');
const { interpolateName } = require('loader-utils');
const { fromBuffer } = require('pdf2pic');
const { createPathIfNotExist } = require('./utils');

module.exports = async function (content) {
    this.cacheable(false);
    console.log(content);
    const options = this.getOptions();
    console.log('==========options', options);

    // const convertOptions = {
    //     width: 2550,
    //     height: 3300,
    //     density: 330,
    //     saveFilename: "untitled",
    //     savePath: ".",
    //     format: "png"
    // };
    // fromBuffer(content, convertOptions)(1, false)

    // 1. 定义转换后的image文件名
    let name = options.name || '[name]-[contenthash]';
    name = interpolateName(this, name, {
        context: this.context,
        content
    });

    // 2. 定义转换后的图片路径
    let outputAbsPath = this._compiler.outputPath;
    let publicPath = path.join('.', name);

    if (options.outputPath) {
        outputAbsPath = path.join(outputAbsPath, options.outputPath);
        publicPath = path.join(options.outputPath, name);
    }

    createPathIfNotExist(outputAbsPath);

    // 3. 执行转换/拷贝处理
    const convertOptions = {
        width: 2550,
        height: 3300,
        density: 330,
        saveFilename: name,
        savePath: outputAbsPath,
        format: "png"
    };
    const r = await fromBuffer(content, convertOptions)(-1, false)

    const imgPath = this.utils.contextify(
        this._compiler.outputPath,
        r.path
    );

    // 4. 导出文件名（string ｜ array）
    return `export default ${JSON.stringify(imgPath)}`;
}

module.exports.raw = true;