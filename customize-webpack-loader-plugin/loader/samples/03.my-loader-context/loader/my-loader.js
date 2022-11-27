module.exports = function (content) {
    console.log('========== [my-loader] start');

    // 被处理模块所在路径
    console.log('========== [my-loader] context', this.context);

    // 接收pitch阶段传递过来的数据(没有pitch阶段函数，则为null)
    console.log('========== [my-loader] data', this.data);

    // cacheable标识loader的处理结果是否可被缓存（默认为true）
    this.cacheable(false);

    // this.callback: 返回模块的处理结果或者错误
    const result = `export default ${JSON.stringify('Hello webpack')}`;
    // 有错误时，会无视result结果，直接抛出错误
    // this.callback(new Error('Webpack Loader Error'), result);
    // 如果想返回转换结果，则第一个参数需要传null
    this.callback(null, result);

    // this.async: 声明当前的loader为异步处理（详见后面例子）

    // this.emitFile: 生成一个文件
    this.emitFile('index.js', content);

    // return 'Hello webpack';
    return `export default ${JSON.stringify('Hello webpack')}`;
}