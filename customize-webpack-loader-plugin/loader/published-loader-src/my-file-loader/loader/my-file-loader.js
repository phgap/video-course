const { interpolateName } = require('loader-utils');
const schema = require('./schema.json');

module.exports = function (content) {
    // 获取传递给loader的选项
    const options = this.getOptions(schema);
    // 确定文件名

    // contenthash会被替换为hash值，由content内容生成
    const name = options.name || '[contenthash].[ext]';

    const outputPath = interpolateName(this, name, {
        content: content
    });

    this.emitFile(outputPath, content);

    return `export default ${JSON.stringify(outputPath)}`;
}

module.exports.raw = true;