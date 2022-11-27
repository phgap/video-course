const { parse } = require('@textlint/markdown-to-ast');

module.exports = function (content) {

    console.log('==========[markdown-loader] executed.');
    const ast = parse(content);
    // console.log('==========[markdown-loader]ast:', ast);
    const codeBlock = ast.children.find(node => node.type === 'CodeBlock' && node.lang === 'js');
    if (!codeBlock) {
        throw new Error('Could not find code block');
    }
    console.log('==========[export]\n', `export default ${JSON.stringify(codeBlock.value)}`);
    console.log('==========[codeBlock.value]\n', codeBlock.value);
    return `export default ${JSON.stringify(codeBlock.value)}`;
    // return codeBlock.value;
}