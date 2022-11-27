module.exports = function (content) {
    console.log('[my-loader]', content);
    return content;
}

module.exports.raw = true;