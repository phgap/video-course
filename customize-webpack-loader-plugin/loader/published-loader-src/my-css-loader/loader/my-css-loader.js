const postcss = require('postcss');

module.exports = function (content) {
    const result = postcss([]).process(content);
    console.log(result);
    return 'result';
}