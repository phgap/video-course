module.exports = function (content) {
    console.log('loader-1 normal');
    return `${content}console.log('added in loader-1');`;
}

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
    console.log('loader-1 pitch');
};