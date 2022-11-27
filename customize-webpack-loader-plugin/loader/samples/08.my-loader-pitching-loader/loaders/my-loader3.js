module.exports = function (content) {
    console.log('loader-3 normal');
    return `${content}console.log('added in loader-3');`;
}

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
    console.log('loader-3 pitch');
};